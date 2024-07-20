import smtplib
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart


def send_email(to_email, subject, body, **kwargs):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = "vani.lib.mad3@gmail.com"
    message["To"] = "vani.lib.mad3@gmail.com"

    message.attach(MIMEText(body, "html"))

    for image_cid, image_path in kwargs.get("image_paths", {}).items():
        with open(image_path, "rb") as fp:
            image = MIMEImage(fp.read())
            image.add_header("Content-ID", f"<{image_cid}>")
            message.attach(image)

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login("vani.lib.mad3@gmail.com", "FILL_PASSWORD_HERE")
        smtp.send_message(message)
