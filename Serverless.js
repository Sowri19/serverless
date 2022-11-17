var aws = require("aws-sdk");
aws.config.update({region:'us-east-1'})
var ses = new aws.SES({ region: "us-east-1" });
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = async function (event) {
    let message = event.Records[0].Sns.Message
    let json = JSON.parse(message);
    let email = json.EmailId;
    let token = json.token;
    const seconds = 5 * 60;
    const secondsInEpoch = Math.round(Date.now() / 1000);
    const expirationTime = secondsInEpoch + seconds;
    const currentTime = Math.round(Date.now() / 1000);

    // initializing the table for dynamodb
    var table = {
        TableName : "csye-6225",
        Item:{
          "username" : email,
          "token" : token,
          "TimeToExist" :expirationTime
        }
      }
      console.log("new item added to the table");

      docClient.put(table, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added:", JSON.stringify(data, null, 2));
        }
    });
    console.log(email + " " +token + "  Parameters set for the table");

const mailbody = `
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
      <p>Hello, ${email}</p>
      <p>Please verify your emailId</br>
      <b>Link is going to be valid for only 2-5 minutes</b></br>
      Find your link below:</p>
      <p><a href=https://demo.sowri.me/v1/client/verifyUserEmail?token=${token}&email=${email} >
        https://demo.sowri.me/v1/client/verifyUserEmail?token=${token}&email=${email} </a> </p>
        </body></html>
    </body>
</html>`;

var params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: mailbody,
        },
      }, 
      Subject: {
          Charset: "UTF-8",
          Data: "Email Verification",
        },
      },
      Source: "sender@demo.sowri.me",
    };
    console.log("email has been sent");
    return ses.sendEmail(params).promise()
};  