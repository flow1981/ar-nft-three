const https = require('https');

exports.handler = async (event) => {

  async function getTLE() {
      const options = {
          host: 'celestrak.com',
          path: '/NORAD/elements/stations.txt',
      }
      return new Promise((resolve, reject) => {
          const request = https.request(options, (response) => {
              console.log('requesting')
              let body = '';
              response.on('data', (rawData) => {
                  body += rawData;
              })
              response.on('end', () => {
                  resolve(body);
              })
          });
          request.on('error', (err) => {
              reject(err)
          });
          request.end();
      })
    }
    const response = {
        "statusCode": 200,
        "body": JSON.stringify(await getTLE()),
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }
    return response;
};
