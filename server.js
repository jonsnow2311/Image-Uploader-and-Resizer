var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var path = require('path');
var im = require('imagemagick');
var fs = require('fs');
var sharp = require('sharp');
var app = express();

app.use(express.json());

//Defining the local storage as storage engine for multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename(req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });

//Connecting to MongoDB server
mongoose.connect('mongodb://localhost:27017/picsManipulator', { useNewUrlParser: false })
  .then(() => console.log('connect')).catch(err => console.log(err))

// making the collection(table) schema  
// it contains picspath file for saving the file path  
var picSchema = new mongoose.Schema({
  picspath: String
});

//collection schema will be saved in DB by name pics   
// picModel contains the instance of pics by which it can manipulate data in it.  
var picModel = mongoose.model('pic', picSchema)

var picPath = path.resolve(__dirname, 'public');

app.use(express.static(picPath));

app.use(bodyParser.urlencoded({ extended: false }))

//GET Route for getting all IDs of the images currently in the MongoDb
app.get('/', (req, res) => {
  picModel.find((err, data) => {
    if (err) {
      console.log(err)
    }
    res.json(data);
  })
})

//POST Route for uploading the pic and saving its path in MongoDB
app.post('/upload', upload.single('pic'), (req, res) => {
  var x = 'uploads/' + req.file.originalname;
  var picss = new picModel({
    picspath: x
  })
  picss.save((err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log('data', data)
      res.redirect('/')
    }
  })
});

//GET Route for resizing and downloading the image
app.get('/download/:id', (req, res) => {
  picModel.find({ _id: req.params.id }, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      //Creating path of the image
      var path = __dirname + '/' + data[0].picspath;

      var readableStream = fs.createReadStream(path);
      const transformer = sharp()
        .resize({
          width: req.body.width,
          height: req.body.height,
          fit: 'contain'
        });
      // Read image data from readableStream
      readableStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readableStream
          .pipe(transformer)
          .pipe(res);
      });

      // This catches any errors that happen while creating the readable stream (usually invalid names)
      readableStream.on('error', function (err) {
        res.end(err);
      });
    }
  })
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running at ${port}`))

module.exports = app; 