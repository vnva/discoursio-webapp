from flask import Flask, request
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError, WaiterError
import tempfile
import os

app = Flask(__name__)
session = boto3.Session()
storj_resource = session.resource('s3')
storj_client = boto3.client('s3',
                            aws_access_key_id=os.environ['STORJ_ACCESS_KEY'],
                            aws_secret_access_key=os.environ['STORJ_SECRET_KEY'],
                            endpoint_url=os.environ['STORJ_END_POINT']
                            )


def upload_storj(filecontent, filename, bucket_name):
    success = False

    try:
        bucket = storj_resource.Bucket(bucket_name)
    except ClientError:
        bucket = None

    try:
        # In case filename already exists, get current etag to check if the
        # contents change after upload
        head = storj_client.head_object(Bucket=bucket_name, Key=filename)
    except ClientError:
        etag = ''
    else:
        etag = head['ETag'].strip('"')

    try:
        s3_obj = bucket.Object(filename)
    except (ClientError, AttributeError):
        s3_obj = None

    try:
        # Use the upload_fileobj method to safely upload the file
        storj_client.upload_fileobj(
            Fileobj=filecontent,
            Bucket='discours.io',
            Key=filename
        )
    except (ClientError, AttributeError):
        pass
    else:
        try:
            s3_obj.wait_until_exists(IfNoneMatch=etag)
        except WaiterError:
            pass
        else:
            head = storj_client.head_object(Bucket=bucket_name, Key=filename)
            success = head['ContentLength']

    return success


@app.route('/upload', methods=['post'])
def upload():
    if request.method == 'POST':
        img = request.files['file']
        if img:
            # Perform the file upload
            filename = secure_filename(img.filename)
            # Save the file to a temporary location
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = os.path.join(temp_dir, filename)
                img.save(temp_path)
                # Open the file in binary mode
                with open(temp_path, 'rb') as filecontent:
                    return upload_storj(filecontent, filename, 'discours.io')
    return


if __name__ == "__main__":
    app.run()
