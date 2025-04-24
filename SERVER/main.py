from flask import Flask, request, render_template, redirect, url_for, flash, session, jsonify
import mysql.connector
from mysql.connector import Error
from flask_mail import Mail, Message

app = Flask(__name__)
app.secret_key = 'mitra_blood_donor_1234'

def sendRequest(blood, location, patient, contact, Urgency):
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'email@gmail.com'
    app.config['MAIL_DEFAULT_SENDER'] = 'email@gmail.com'
    app.config['MAIL_PASSWORD'] = 'pass'
    mail = Mail(app)
    msg = Message(f"Urgent Blood Donation Needed - {blood} in {location}", sender='emial@gmail.com', recipients=["email@gmail.com"])
    msg.body = f"""
Dear Donor,

We are reaching out to request your urgent help. A patient is in immediate need of {blood} blood in {location}.

🩸 Patient Details:
- Required Blood Group: {blood}
- Location: {location}
- Contact Person: {patient}, {contact}
- Urgency: {Urgency}

If you are available and willing to donate, please get in touch as soon as possible. Your generosity could save a life today.

Thank you for being a hero!

Warm regards,  
MITRA Team  
"""

    try:
        mail.send(msg)
        flash("🎉 Requested Blood successfully!")
        return True
    except Exception as e:
        print(f"Error sending email {e}")
        return False

def fetch_mysql_query(query, params=None, fetch=False):
    try:
        db = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Root@123',
            database='mitra_donors',
            port=3306
        )
        cursor = db.cursor(dictionary=True)
        cursor.execute(query, params)
        if fetch:
            return cursor.fetchall()
        db.commit()
    except Error as e:
        print(f"❌ Error: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
    
def run_mysql_query(query, params=None):
    try:
        db = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Root@123',
            database='mitra_donors',
            port=3306
        )
        cursor = db.cursor()
        cursor.execute(query, params)
        db.commit()
        return cursor.lastrowid
    except Error as e:
        print("❌ MySQL Error:", e)
        return None

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


@app.route("/", methods = ["Get", "Post"])
def home():
    return render_template("index.html")

@app.route("/register", methods = ["POST"])
def register_donor():
    name = request.form.get('donor-name')
    age = request.form.get('donor-age')
    gender = request.form.get('donor-gender')
    blood_group = request.form.get('donor-blood-group')
    contact = request.form.get('donor-contact')
    location = request.form.get('donor-location')
    availability = request.form.get('donor-availability')

    query = """
    INSERT INTO donors (full_name, age, gender, blood_group, contact_number, location, availability)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    params = (name, age, gender, blood_group, contact, location, availability)

    run_mysql_query(query, params)
    flash("🎉 Donor registered successfully!")
    return redirect(url_for('home'))

@app.route("/search_donors", methods=["POST"])
def search_donors():
    blood_type = request.form.get("blood_type")
    location = request.form.get("location")

    query = "SELECT * FROM donors WHERE 1=1"
    params = []

    if blood_type:
        query += " AND blood_group = %s"
        params.append(blood_type)
    if location:
        query += " AND location = %s"
        params.append(location)

    results = fetch_mysql_query(query, params, fetch=True)
    return jsonify(results)


@app.route("/request_blood", methods= ["POST", "GET"])
def request_blood():
    patient_name = request.form.get("patient_name")
    blood_type = request.form.get("blood_type")
    Urgency = request.form.get("Urgency")
    location = request.form.get("location")
    donor_contact = request.form.get("donor-contact")

    sendRequest(blood_type, location, patient_name, donor_contact, Urgency)

    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)