import express from 'express';
import dotenv from 'dotenv';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
dotenv.config();

// GET Method
router.get(`/`, async (req, res) => {
    try {
        const userlist = await User.find().select('-password'); // ila hydna dak - ghadi yjib lina ghir password bohdo 
        res.status(200).json(userlist);
    } catch (err) {
        res.status(500).json({ message: 'Error getting users', error: err.message });
    }
});

router.get(`/:id`, async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findById(id).select('-password'); //dak select kandiroha bash mayrj3sh lpassword f3amalyat get
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error getting user', error: err.message });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments(); // had countDocuments katrj3 lina shhal kayn dyal document 
        res.send({userCount: userCount})
    } catch (err) {
        res.status(500).json({ message: 'Error getting userCount', error: err.message });
    }
});

// POST method
router.post(`/`, async (req, res) => {
    const { name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, email, password: hashedPassword, phone, isAdmin, street, apartment, zip, city, country
        });
        const saveUser = await user.save();
        res.status(200).json(saveUser);
    } 
    catch (err) {
        res.status(500).json({ message: 'Error posting data', error: err.message });
    }
});

router.post(`/login`, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
           return res.status(404).json('User Not Found!');
        }
        const isMatch  = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Email Or Password!' });
        }
        if (email && isMatch) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                },
                process.env.JWT_SECRET,
                {expiresIn: '7d'}
            )
            return res.status(200).json({user: user.email, token: token});
        }  
    } 
    catch (err) {
       return  res.status(500).json({ message: 'You Cannot Login!', error: err.message });
    }
});

router.post(`/register`, async (req, res) => {
    const { name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, email, password: hashedPassword, phone, isAdmin, street, apartment, zip, city, country
        });
        const newUser = await user.save();
        res.status(200).json(newUser);
    } 
    catch (err) {
        res.status(500).json({ message: 'Error posting data', error: err.message });
    }
});

// PUT Method
router.put(`/:id`, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;
    try {
        const putUser = await User.findByIdAndUpdate(id, {
            name, email, password, phone, isAdmin, street, apartment, zip, city, country
        }, { new: true });
    
        if (!putUser) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('User updated successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error updating data', error: err.message });
    }
});


// DELETE Method
router.delete(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('User deleted successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error deleting data', error: err.message });
    }
});

export default router;
