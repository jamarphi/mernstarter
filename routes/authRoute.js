const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register',(req,res) => {
    const {name,email,password} = req.body;
    let errors = [];

    if(!name || !email || !password){
        errors.push('please enter all fields');
    }

    if(name.length > 60){
        errors.push('name is too large it must be less than 60 characters');
    }

    if(name.length < 3){
        errors.push('name is too small it must be greater than 3 characters');
    }

    if(email.length > 60){
        errors.push('name is too large it must be less than 60 characters');
    }

    if(email.length < 3){
        errors.push('name is too small it must be greater than 3 characters');
    }

    if(!email.includes('@')){
        errors.push('invalid email');
    }

    //check to see if the email already exists
    User.findOne({email})
        .then(user => {
            if(user !== null) errors.push('email already exists');

            if(errors.length > 0) return res.status(400).json({msg: errors});

            bcrypt.genSalt(10,(err,salt) => {
                if(err) throw err;

                bcrypt.hash(password,salt,(err,hash) => {
                    if(err) throw err;

                    //create new user
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    //set new password to the generated hash
                    newUser.password = hash;

                    newUser.save()
                        .then(user => {
                            //create new json web token

                            jwt.sign(
                                {id: user._id},
                                process.env.JWT_SECRET,
                                {expiresIn: 3600},
                                (err,token) => {
                                    if(err) throw err;

                                    const newObj = {
                                        _id: user._id,
                                        token
                                    }
                                    res.status(200).json(newObj);
                                }
                            );
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({msg: 'server is down right now please try again later'});
                        });
                });
            });
        })
        .catch(err => console.log(err));
});

router.post('/login',(req,res) => {
    const {email,password} = req.body;
    let errors = [];

    if(!email || !password){
        errors.push('please enter all fields');
    }

    if(email.length > 60){
        errors.push('name is too large it must be less than 60 characters');
    }

    if(email.length < 3){
        errors.push('name is too small it must be greater than 3 characters');
    }

    if(!email.includes('@')){
        errors.push('invalid email');
    }

    if(errors.length > 0) return res.status(400).json({msg: errors});

    User.findOne({email})
        .then(user => {
            if(!user) return res.status(400).json({msg: 'email was not found'});

            bcrypt.compare(password,user.password,(err,success) => {
                if(err) throw err;

                if(!success) return res.status(400).json({msg: 'password is invalid for this email'});

                //create new json web token
                jwt.sign(
                    {id: user._id},
                    process.env.JWT_SECRET,
                    {expiresIn: 3600},
                    (err,token) => {
                        if(err) throw err;

                        const newObj = {
                            _id: user._id,
                            token
                        }
                        res.status(200).json(newObj);
                    }
                );
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({msg: 'server is down please try again later'});
        })
});

module.exports = router;