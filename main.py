from flask import Flask, request, redirect, url_for, session, render_template
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

database = os.getenv('database')
app_secret = os.getenv('app_secret')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///traffic.db'
app.secret_key = app_secret
db = SQLAlchemy(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if database is None:
            return redirect(url_for('install', next=request.url))
        else:
            if User.query.all():
                if session['user']:
                    user_session = session['user']
                    if User.query.filter_by(email=user_session).all():
                        return f(*args, **kwargs)
                    else:
                        return redirect('/login')
                else:
                    return redirect('/login')
            else:
                return redirect('/install')
    return decorated_function

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100))
    password = db.Column(db.String(100))

class Traffic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    country = db.Column(db.String(50))
    url = db.Column(db.String(100))
    referral = db.Column(db.String(100))
    browser = db.Column(db.String(50))
    os = db.Column(db.String(50))
    device = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.now())

@app.route('/')
@login_required
def home():
    duration = request.args.get('duration')
    # return """
    # <script src="/track.js" type="text/javascript"> </script>
    # """
    return render_template('landing.html')

@app.route('/install', methods=['POST', 'GET'])
def install():
    if request.method == 'POST':
        if User.query.all():
            return render_template('login.html', create=False, error="Admin User already exists. Please Login Instead")
        # Check to make sure there is no other account
        email = request.form['email']
        password = request.form['password']
        myaccount = User(email=email, password=password)
        db.session.add(myaccount)
        db.session.commit()
        session['user'] = email
        return redirect('/')
    else:
        return render_template('login.html', create=True)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        check = User.query.filter_by(email=email, password=password).all()
        if check:
            session['user'] = email
            return redirect('/')
        else:
            return render_template('login.html', create=False, error="The username and Password Combination were incorrect")
    else:
        return render_template('login.html', create=False)

@app.route('/track.js')
def serve_js():
    with open('track.js', 'r') as f:
        js = f.read()
    return js

@app.route('/track', methods=['POST'])
def track():
    data = request.json
    traffic = Traffic(
        user_id=data['user_id'],
        url=data['url'],
        country=data['country'],
        referral=data['referral'],
        browser=data['browser'],
        os=data['os'],
        device=data['device']
    )
    db.session.add(traffic)
    db.session.commit()
    return 'OK', 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)