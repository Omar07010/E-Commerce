import express from 'express';
import dotenv, { populate } from 'dotenv';
import Order from '../models/order.js';
import OrderItem from '../models/order-item.js';


const router = express.Router();
dotenv.config();



// GET Methods
router.get(`/`, async (req, res) => {
    try {
        const orderlist = await Order.find().populate('user', 'name').sort({'dateOrder': -1}); 
        res.status(200).json(orderlist);
    } catch (err) {
        res.status(500).json({ message: 'Error getting data', error: err.message });
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const {id} = req.params
        const order = await Order.findById(id)
        .populate('user', 'name').sort({'dateOrder': -1})
        .populate({ 
             path: 'orderItems',
             populate: {path:'product', populate: 'category'}
            }); 
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error getting data', error: err.message });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const ordertCount = await Order.countDocuments(); 
        res.send({ordertCount: ordertCount})
    } catch (err) {
        res.status(500).json({ message: 'Error getting productCount', error: err.message });
    }
});


// POST Methods
router.post(`/`, async (req, res) => {
    try{

        const orderItemIds = await Promise.all(req.body.orderItems.map(async orderItem => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product    
            });
            const savedOrderItem = await newOrderItem.save();
            return savedOrderItem._id;
        }));
        
        const orderItemsIdsResolves = await orderItemIds;

        const totalPrices = await Promise.all(orderItemsIdsResolves.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
            let totalPrice = orderItem.product.price * orderItem.quantity;
            
            return totalPrice
        }));
        
        const totalPrice = totalPrices.reduce((accumulator, element) => {
            return accumulator + element;
        }, 0);

        const newOrder = new Order({ 
            orderItems: orderItemsIdsResolves,
            shippingAddress1: req.body.shippingAddress1, 
            shippingAddress2: req.body.shippingAddress2, 
            city: req.body.city, zip: req.body.zip, 
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status, 
            totalPrice: totalPrice, 
            user: req.body.user });
        const saveOrder = await newOrder.save()        

        res.status(201).json(saveOrder);
        
    }catch(err){
        console.error(err)
        res.status(500).json(err);
    }
});

// Another GET Method becouse of hosting
router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: {_id: null, totalsales: {$sum: '$totalPrice'}} }
    ]);
    if (!totalSales) {
        res.status(500).json({ message: 'Error getting totalSales' });
    } else {
        res.status(200).json({totalsales: totalSales.pop().totalsales});
    }
});

router.get(`/get/userorder/:userid`, async (req, res) => {
    try {
        const userOrderList = await Order.find({user: req.params.userid}).populate({ 
            path: 'orderItems',
            populate: {path:'product', populate: 'category'}
           }).sort({'dateOrder': -1}); 
           
        res.send({userOrderList})
    } catch (err) {
        res.status(500).json({ message: 'Error getting productCount', error: err.message });
    }
});
// PUT Methods
router.put(`/:id`, async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;
        const order = await Order.findByIdAndUpdate(id, 
        { 
            status: status
        },
        { new: true}
    )
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error updating data', error: err.message });
    }
});

// DELETE Methods
router.delete(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      
        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

 
        await Promise.all(order.orderItems.map(async (orderItemId) => {
            return OrderItem.findByIdAndDelete(orderItemId);
        }));

        res.status(200).json('Order and associated items deleted successfully!');
    } catch (err) {
        res.status(500).json({ message: 'Error deleting data', error: err.message });
    }
});


export default router;