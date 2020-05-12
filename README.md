# Uploading image with Multer in Node and resizing it using sharp npm package


## Development server

Run `node server.js` for a dev server. Navigate to `http://localhost:3000/`.

1. 

GET - `http://localhost:3000/`

2. 

POST - `http://localhost:3000/upload`

Select Body->form-data->{ key: pic , value: "your desired pic"}

3.

GET - `http://localhost:3000/download/:id`

Inside body define height and width.

