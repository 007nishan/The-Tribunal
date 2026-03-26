from flask import Flask, render_template, request, redirect, url_for, session, flash
from models import db, User, AuditCase, Dispute, Argument, NeuralGeodeEntry
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-tribunal'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tribunal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Dummy users for testing without a full auth system yet
def insert_dummy_data():
    if User.query.first():
        return
    roles = ['Auditor', 'QC', 'Auditor_POC', 'QC_POC', 'Appellate', 'Ops', 'Training']
    for idx, role in enumerate(roles):
        user = User(username=f'{role.lower()}_user', role=role)
        db.session.add(user)
    db.session.commit()
    
    # create sample case and dispute
    auditor = User.query.filter_by(role='Auditor').first()
    case = AuditCase(title="Case 1001: Refund Eligibility", description="User claimed refund for late delivery.", auditor_id=auditor.id)
    db.session.add(case)
    db.session.commit()

with app.app_context():
    db.create_all()
    insert_dummy_data()

@app.before_request
def mock_auth():
    # Simple mock authentication by passing ?user_id=1 in url to switch, or keeping session.
    user_id = request.args.get('user_id')
    if user_id:
        session['user_id'] = int(user_id)
        
@app.context_processor
def inject_user():
    user = User.query.get(session.get('user_id')) if session.get('user_id') else None
    users = User.query.all()
    return dict(current_user=user, all_users=users)

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))

@app.route('/login')
def login():
    users = User.query.all()
    return render_template('login.html', users=users)

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    disputes = Dispute.query.all()
    return render_template('dashboard.html', disputes=disputes)

@app.route('/dispute/<int:dispute_id>', methods=['GET', 'POST'])
def dispute_view(dispute_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    dispute = Dispute.query.get_or_404(dispute_id)
    arguments = Argument.query.filter_by(dispute_id=dispute.id).order_by(Argument.timestamp).all()
    
    if request.method == 'POST':
        logic = request.form.get('logic')
        reference = request.form.get('reference')
        if logic:
            arg = Argument(dispute_id=dispute.id, user_id=session['user_id'], logic=logic, quoted_reference=reference)
            db.session.add(arg)
            
            # Change status based on user role (mock hierarchical logic)
            user = User.query.get(session['user_id'])
            if user.role == 'QC' and dispute.status == 'Pending':
                dispute.status = 'Pending Auditor Revert'
            elif user.role == 'Auditor':
                dispute.status = 'Pending QC Acceptance'
            elif user.role == 'QC_POC':
                dispute.status = 'Escalated to Appellate Court'
                
            db.session.commit()
            flash("Argument added successfully.")
            return redirect(url_for('dispute_view', dispute_id=dispute.id))
            
    # fetch mock geode entries
    geode_entries = db.session.query(NeuralGeodeEntry).order_by(NeuralGeodeEntry.timestamp.desc()).limit(5).all()

    return render_template('dispute.html', dispute=dispute, arguments=arguments, geode_entries=geode_entries)

@app.route('/create_dispute', methods=['POST'])
def create_dispute():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Just creating a dummy case to link the dispute for now
    case = AuditCase.query.first()
    dispute = Dispute(case_id=case.id, status="Pending Auditor Revert")
    db.session.add(dispute)
    db.session.commit()
    
    logic = request.form.get('logic')
    reference = request.form.get('reference')
    if logic:
        arg = Argument(dispute_id=dispute.id, user_id=session['user_id'], logic=logic, quoted_reference=reference)
        db.session.add(arg)
        db.session.commit()

    return redirect(url_for('dashboard'))

@app.route('/neural_geode/flag/<int:entry_id>', methods=['POST'])
def flag_geode(entry_id):
    entry = NeuralGeodeEntry.query.get_or_404(entry_id)
    flag = request.form.get('flag')
    if flag in ['Green', 'Red']:
        entry.flag_status = flag
        db.session.commit()
    return redirect(request.referrer)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
