import boto3
import json

def make_bucket_public(bucket_name):
    s3 = boto3.client(
        's3',
        endpoint_url='http://localhost:9000',
        aws_access_key_id='minioadmin',
        aws_secret_access_key='minioadmin'
    )

    # Это специальное правило (Policy), которое разрешает всем смотреть картинки
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                "Resource": [f"arn:aws:s3:::{bucket_name}"]
            },
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
            }
        ]
    }

    s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
    print(f"Готово! Бакет '{bucket_name}' теперь публичный.")

if __name__ == "__main__":
    make_bucket_public("trips")