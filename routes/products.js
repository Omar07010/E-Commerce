import express from 'express';
import dotenv from 'dotenv';
import Product from '../models/product.js';
import Category from '../models/category.js';
import mongoose from 'mongoose';
import multer from 'multer';
 
const FILE_TYPE_MAP = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/jpg': 'jpg',
};

// Multar DiskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        if (isValid) {
            cb(null, 'public/uploads');
        } else {
            cb(new Error('Invalid image type'), null); // ila makant ta whda mn hado jpg ola png ola jpeg ghadi yrj3 lina error
        }
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('_');
      const extention = FILE_TYPE_MAP[file.mimetype]; // hadi ghadi trj3 lin nw3 dyal image wash jpg ola png ola jpeg
      cb(null, `${fileName}+${Date.now()}.${extention}`)
    }
})
  
const upload = multer({ storage: storage })

const router = express.Router();
dotenv.config();


// GET Methods
router.get(`/`, async (req, res) => {
    try {
        const productlist = await Product.find(); 
    } catch (err) {
        res.status(500).json({ message: 'Error getting productlist', error: err.message });
    }
});

router.get(`/:id`, async (req, res) => {
    const {id} = req.params
    try {
        const product = await Product.findById(id).populate('category', );
    } catch (err) {
        res.status(500).json({ message: 'Error getting product', error: err.message });
    }
});

        // FEALTRING 
router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();  
        res.send({productCount: productCount})
    } catch (err) {
        res.status(500).json({ message: 'Error getting productCount', error: err.message });
    }
});

router.get(`/get/featured`, async (req, res) => {
    try {
        const productFeatured = await Product.find({isFeatured: true}); 
        res.send({productFeatured})
    } catch (err) {
        res.status(500).json({ message: 'Error getting productFeatured', error: err.message });
    }
});
router.get(`/get/featured/:count`, async (req, res) => {
    const {count} = req.params ? req.params : 0;
    try {
        const productFeatured = await Product.find({isFeatured: true}).limit(+count);
        res.send({productFeatured})
    } catch (err) {
        res.status(500).json({ message: 'Error getting productFeatured', error: err.message });
    }
});
    // fealting by Category
router.get(`/`,  (req, res) => {
    const filter = {}
    if (req.query) {
        filter = {category: req.query.split(',')};
    }
    const productFeatured =  Product.find(filter).populate('category');; 
    res.send({productFeatured})
    if (!productFeatured) {
        res.status(500).json({ message: 'Error getting productFeatured', error: err.message });
    }
    
});

// POST Methods
router.post(`/`, upload.single('image'), async (req, res) => {
    const { name, description, richDescription, brand, price, category, countInStock, rating, numReviwes, isFeatured } = req.body;
    const findCategory = await Category.findById(req.body.category);
    if (!findCategory) return res.status(404).json({ message: 'Failed to post data' });

    const file =  req.file;
    if (!file) return res.status(404).json({ message: 'No image in the request!' });

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const fileName =req.file.filename;

    try {
        const newProduct = new Product({
            name,
            description,
            richDescription,
            image: `${basePath}${fileName}`,
            brand,
            price,
            category,
            countInStock,
            rating,
            numReviwes,
            isFeatured
        });
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: 'Data posted successfully!', product: savedProduct });
    } catch (err) {
        res.status(500).json({ message: 'Failed to post data', error: err.message });
    }
});


// PUT Method
router.put(`/:id`, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        res.status(404).json({ message: 'Invalaid Product Id'});
    }
    const { name, description, richDescription, image, brand, price, category, countInStock, rating, numReviwes, isFeatured  } = req.body;
    const findCategory = await Category.findById(req.body.category);
    if(!findCategory) return res.status(404).json({ message: 'Failed to update data'});
    try {
        const putProduct = await Product.findByIdAndUpdate(id, {
            name, description, richDescription, image, brand, price, category, countInStock, rating, numReviwes, isFeatured 
        }, { new: true });
    
        if (!putProduct) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('Product updated successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
});

router.put(`/gallery/:id`, upload.array('images', 10), async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        res.status(404).json({ message: 'Invalaid Product Id'});
    }
    const files = req.files;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let imagesPaths = []
    if (files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${fileName}`)
        })
    }
      
    try {
        const putProduct = await Product.findByIdAndUpdate(id, {
            images: imagesPaths
        }, { new: true });
    
        if (!putProduct) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('Product updated successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
});

// DELETE Method
router.delete(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false });
        }
        res.status(200).json('Product deleted successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error deleting data', error: err.message });
    }
});


export default router;
