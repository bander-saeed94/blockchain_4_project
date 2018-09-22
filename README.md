
[![HitCount](http://hits.dwyl.io/bander-saeed/blockchain_4_project.svg)](http://hits.dwyl.io/bander-saeed/blockchain_4_project)

# Local Development API Server
## Usage
#### Request address validation
```
curl "http://localhost:1337/requestValidation"
```

###### Parameters
```
{
    "address": <address>
}
```

#### validate message
````
curl "http://localhost:1337/message-signature/validate"
````
###### Parameters
```
{
    "address": <address> ,
    "signature": <signature>
}
```

#### register a star
```
curl -X "POST" "http://localhost:1337/block"
```
###### Parameters
```
{
    "address": "<address>",
    "star": {
         "dec": "-22° 22' 24.9",
         "ra": "16h 22m 1.0s",
         "story": "Found star using https://www.google.com/sky/ "
         }
}
```

## Architecture
Local server
- Node.js
- Express.js
- level.js

## Getting Started

Server depends on [node.js LTS Version: v8.11.3 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm)
Please make sure you have these installed before proceeding forward.

Great, you are ready to proceed forward; awesome!

Let's start with running commands in your terminal, known as command line interface (CLI)

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Start the server
```Start server
# node index
```
### You should now have access to your API server environment
Port        : 8000


## Endpoints

### GET Endpoints

#### Get block by height
```
http://localhost:8000/block/<blockHeight>
```
#### Get all stars added by an address 
```
http://localhost:8000/stars/addres:<address>
```
#### Get a star by its hash
```
http://localhost:8000/stars/hash:<hash>
```


### POST Endpoints

#### Request address validation
```
curl "http://localhost:1337/requestValidation"
```

###### Parameters
```
{
    "address": <address>
}
```

#### validate message
````
curl "http://localhost:1337/message-signature/validate"
````
###### Parameters
```
{
    "address": <address> ,
    "signature": <signature>
}
```

#### register a star
```
curl -X "POST" "http://localhost:1337/block"
```
###### Parameters
```
{
    "address": "<address>",
    "star": {
         "dec": "-22° 22' 24.9",
         "ra": "16h 22m 1.0s",
         "story": "Found star using https://www.google.com/sky/ "
         }
}
```