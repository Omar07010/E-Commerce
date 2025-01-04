import express from 'express';
import dotenv from 'dotenv';
import Category from '../models/category.js';

const router = express.Router();
dotenv.config();

// GET Method
router.get(`/`, async (req, res) => {
    try {
        const categoryList = await Category.find();
        res.status(200).json(categoryList);
    } catch (err) {
        res.status(500).json({ message: 'Error getting data', error: err.message });
    }
});

router.get(`/:id`, async (req, res) => {
    const {id} = req.params;
    try {
        const category = await Category.findById(id);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Error getting data', error: err.message });
    }
});

// POST Method
router.post(`/`, async (req, res) => {
    const { name, icon, color } = req.body;
    try {
        const category = new Category({
            name,
            icon,
            color
        });
        const saveCategory = await category.save();
        res.status(200).json(saveCategory);
    } 
    catch (err) {
        res.status(500).json({ message: 'Error posting data', error: err.message });
    }
});

// PUT Method
router.put(`/:id`, async (req, res) => {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    try {
        const putCategory = await Category.findByIdAndUpdate(id, {
            name,
            icon,
            color
        }, { new: true });
    
        if (!putCategory) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('Category updated successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error updating data', error: err.message });
    }
});

// DELETE Method
router.delete(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('Category deleted successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error deleting data', error: err.message });
    }
});


export default router;