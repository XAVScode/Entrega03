const express = require('express');
const path = require('path');
const Stripe = require('stripe');
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_SECRET); // Reemplaza con tu clave secreta de Stripe
//const productsRouter = require('../routes/products');
//const adminProductsRouter = require('../routes/admin_products');
const router = express.Router();
const mongoose= require("mongoose")

function validateAdmin(req, res, next) {
  const header = req.get('x-auth');
  if (!header || header !== 'admin')
    return res
      .status(403)
      .send("Unauthorized access, you don't have administrator privileges");
  next();
}

//router.use('/products', productsRouter);
//router.use('/admin/products', validateAdmin, adminProductsRouter);



router.get('/', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/home.html'))
);
router.get('/home', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/home.html'))
);



router.get('/shopping_cart', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/shopping_cart.html'))
);
router.get('/administrator', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/administrator.html'))
);
router.get('/collection', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/collection.html'))
);
router.get('/product', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/product.html'))
);
router.get('/login', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/login.html'))
);
router.get('/register', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/register.html'))
);
router.get('/profile', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/profile.html'))
);
router.get('/success', (req, res) =>
  res.sendFile(path.resolve(__dirname + '/../views/success.html'))
);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems } = req.body; 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3000/success`, 
      cancel_url: `http://localhost:3000/shopping_cart`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creando la sesión de pago:', error);
    res.status(500).send('Error al crear la sesión de pago');
  }
});


/*
mongoose.connect("mongodb+srv://admin:admin@cinewave.7lkndu5.mongodb.net/?retryWrites=true&w=majority&appName=CineWave")
  .then(()=>console.log("conectado correctamente a mongoDB Atlas"))
  .catch((error)=>console.error(error))
*/
module.exports = router;
