---
layout: post
title: Backing up Route53 Zones to S3 Bucket
categories:
- scripting
tags:
- Scripting
- PowerShell
- Route53
---

I needed a way to backup some Route53 zones in an automated fashion. While there are some individuals who like to wrap this up in a CI/CD pipeline, that just adds complexity to a process that doesn't need that much overhead. I'll leave the Terraform/Jenkins/etc. and other, more complex infrastructure for another time that justifies the administration that comes along with the DevOps tools. Powershell it is then!

The script I configured will create subfolders on the local system where the scheduled task is run in the same directory as the script which will contain all the exported zones. They are currently using a date format to name the folders so if you plan on backing up more than once per day, you will want to modify the script to use a different naming convention so they don't get overwritten on the same day. The local folders will be copied up to an S3 bucket as well. The script is currently configured to remove both local folders and files in S3 that are older than 60 days (again, modifiable). *The script makes no changes to the Route53 zones; it is just an export process.*

I also found a cool utility that makes the export process of the zones much easier. As an added bonus, it exports the zones in proper BIND format so if you ever needed to restore them (ugh!), they are already in a compatible import format for Route53. [Cli53](https://github.com/barnybug/cli53) is the tool I leverage in the script that does the "heavy lifting". There is some pretty solid documentation, but you will want to be sure to set up your credentials as follows if you plan on running this as a scheduled task:

1. Setup a profile for the AWS Credential using the **Managing Profiles** section of the [Specifying Your AWS Credentials](https://docs.aws.amazon.com/powershell/latest/userguide/specifying-your-aws-credentials.html) page. The Environmental Variable method to store credentials proved to be cumbersome in this automated scenario.
2. Create a folder called **.aws** in the same folder where you keep the script and the Cli53 utility. You will need to use the command line (mkdir) as Windows does not allow you to create folders starting with a dot in the Explorer.
3. Put the credentials file you create in the .aws folder.

You can grab the script [here](https://gist.github.com/alan-finn/09e9edb65b680b8cd0a24176d6e541e9). Modify the variables in caps with underscores at the top to fit your environment. Put the script, the cli53 tool, and the .aws folder in the same directory. Finally, configure a schedule task to handle the automation schedule and let 'er rip.

I didn't have any SSO or SAML integration set up for this process so I had to apply an inline policy to the user account for access to the bucket. I used the following:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::CHANGE_TO_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::CHANGE_TO_BUCKET_NAME"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:HeadBucket"
            ],
            "Resource": "*"
        }
    ]
}
```

