
[![HitCount](http://hits.dwyl.io/bander-saeed/blockchain_4_project.svg)](http://hits.dwyl.io/bander-saeed/blockchain_4_project)

This app uses express framework,
to test you need to have node installed
```
node --version
```

Once you download the repo run this command in the project directory
```
npm install
````
This will install dependencies needed

Then you can start the server by running
```
node index
```

TEST the endpoints 

POST http://localhost:8000/requestValidation 
    BODY { "address": "1GESFRLAgAAxrSS19CtSSwSAWELkWDRED2yKt7vXRpWtDVLRzN"}
    
POST http://localhost:8000/message-signature/validate 
    BODY {
	"address": "1GESFRLAgAAxrSS19CtSSwSAWELkWDRED2yKt7vXRpWtDVLRzN",
	"signature": "IIGL/mcEn8za2HUjm8EKtONfp0Wq9ISindwR8fVblAQbltNOTLCm9f8V7S3VOtcny9enhU="
    }

POST http://localhost:8000/block 
    BODY {
        "address": "1GESFRLAgAAxrSS19CtSSwSAWELkWDRED2yKt7vXRpWtDVLRzN",
        "star": {
            "dec": "-22° 22' 24.9",
            "ra": "16h 22m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
    }

GET http://localhost:8000/stars/address/1GESFRLAgAAxrSS19CtSSwSAWELkWDRED2yKt7vXRpWtDVLRzN

GET http://localhost:8000/stars/hash/a7d15c759c044c7d54c580b3d0f96b502e072c409d1f9155a66f99e1790ecf53

GET http://localhost:8000/block/7
