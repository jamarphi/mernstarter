const express = require('express');
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const auth = require('../config/auth');
const router = express.Router();

//multer set up
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        let pathName = path.join(__dirname,'..','public','uploads');
        cb(null,pathName);
    },
    filename: (req,file,cb) => {
        file.filename = file.fieldname + '_' + Date.now() + path.extname(file.originalname);
        let name = file.filename;
        cb(null,name);
    }
});

//use storage engine
const upload = multer({storage});

router.post('/upload/:id',auth,upload.single('userImage'),(req,res) => {
    const {id} = req.params;

    //convert picture from formData type to Buffer type

    const userImage = req.file;

    const picBuffer = fs.readFileSync(path.join(__dirname,'..','public','uploads',userImage.filename));

    //file path that gets removed because this part is unique to every system
    const remove = path.join(__dirname,'..','public');
    const relPath = req.file.path.replace(remove,'');

    const timeStamp = Date.now();
    const userTitle = userImage.originalname.split('.')[0];
    const title = userImage.fieldname;
    const name = userImage.fieldname + '_' + crypto.createHash("sha256").update(title).digest("hex") + 
        '_' + timeStamp;

        const pictureObj = {
            pictureTitle: userTitle,
            pictureName: name,
            picturePath: relPath,
            pictureBuffer: picBuffer,
            pictureType: userImage.mimetype,
            pictureUpdatedAt: timeStamp,
            pictureCreatedAt: timeStamp
        };

        User.findByIdAndUpdate(id,{$push: {pictureList: pictureObj}},{new: true})
            .then(user => {
                res.status(200).json({
                    msg: 'success',
                    obj: pictureObj
                });
            })
            .catch(err => console.log(err));
});

router.get('/retrieve/:id',auth,(req,res) => {
    const id = req.params.id;
    
    User.findById(id)
        .then(user => {
            res.status(200).json({pictures: user.pictureList});
        })
        .catch(err => console.log(err));
});

router.post('/delete/:id',auth,(req,res) => {
    const id = req.params.id;
    const {picCreatedAt} = req.body;
    
    User.findByIdAndUpdate(id,{$pull: {pictureList: {pictureCreatedAt: picCreatedAt}}},{new: true})
        .then(user => {
            res.status(200).json({msg: 'success'});
        })
        .catch(err => console.log(err));
});

module.exports = router;