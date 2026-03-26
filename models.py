from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False) # Auditor, QC, Auditor_POC, QC_POC, Appellate, Ops, Training

class AuditCase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    auditor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    auditor = db.relationship('User', backref=db.backref('cases', lazy=True))

class Dispute(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('audit_case.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending') # Pending Auditor Revert, Escapated to POC, Appellate Court, Closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Argument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dispute_id = db.Column(db.Integer, db.ForeignKey('dispute.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    logic = db.Column(db.Text, nullable=False)
    quoted_reference = db.Column(db.Text, nullable=True)
    attachment_path = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('arguments', lazy=True))

class NeuralGeodeEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    flag_status = db.Column(db.String(20), nullable=True) # Green, Red, None
    ingestor_alias = db.Column(db.String(100), nullable=False)
    authenticity_logo = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
