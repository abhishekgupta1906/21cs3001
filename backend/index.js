const express = require("express");
const axios = require("axios");
const { v3: uuidv4 } = require("uuid"); 
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL;
const token = process.env.API_TOKEN; 


app.get("/categories/:categoryname/products", async (req, res) => {
  const { categoryname } = req.params;
  const {
    top = 10,
    minPrice = 0,
    maxPrice = Infinity,
    sort,
    order = "asc",
    page = 1,
  } = req.query;

  const n = parseInt(top, 10);
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  try {
    
    const responses = await Promise.all([
        axios.get(`${baseURL}/AMZ/categories/${categoryname}/products`, {
            params: { minPrice, maxPrice, top: 100 },
            headers: { Authorization: `Bearer ${token}` }, 
          }),
          axios.get(`${baseURL}/SNP/categories/${categoryname}/products`, {
            params: { minPrice, maxPrice, top: 100 },
            headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
          }),
          axios.get(`${baseURL}/FLP/categories/${categoryname}/products`, {
            params: { minPrice, maxPrice, top: 100 },
            headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
          }),
          axios.get(`${baseURL}/MYN/categories/${categoryname}/products`, {
            params: { minPrice, maxPrice, top: 100 },
            headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
          }),
          axios.get(`${baseURL}/AZO/categories/${categoryname}/products`, {
            params: { minPrice, maxPrice, top: 100 },
            headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
          }),
     
    ]);

    
    let products = responses.flatMap((response) => response.data);

    
    products = products.filter(
      (product) => product.price >= min && product.price <= max
    );

    // Sort products if sort parameter is provided
    if (sort && ["rating", "price", "company", "discount"].includes(sort)) {
      products.sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];
        return order === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    // Paginate the products
    const startIndex = (page - 1) * n;
    const endIndex = page * n;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Generate custom UUIDs for each product
    const productsWithUUID = paginatedProducts.map((product) => ({
      ...product,
      custom_id: uuidv4(),
    }));

    res.json(productsWithUUID);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/categories/:categoryname/products/:productid", async (req, res) => {
  const { categoryname, productid } = req.params;
  const { minPrice = 0, maxPrice = Infinity } = req.query;

  try {
    
    const responses = await Promise.all([
      axios.get(`${baseURL}/AMZ/categories/${categoryname}/products`, {
        params: { minPrice, maxPrice, top: 100 },
        headers: { Authorization: `Bearer ${token}` }, 
      }),
      axios.get(`${baseURL}/SNP/categories/${categoryname}/products`, {
        params: { minPrice, maxPrice, top: 100 },
        headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
      }),
      axios.get(`${baseURL}/FLP/categories/${categoryname}/products`, {
        params: { minPrice, maxPrice, top: 100 },
        headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
      }),
      axios.get(`${baseURL}/MYN/categories/${categoryname}/products`, {
        params: { minPrice, maxPrice, top: 100 },
        headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
      }),
      axios.get(`${baseURL}/AZO/categories/${categoryname}/products`, {
        params: { minPrice, maxPrice, top: 100 },
        headers: { Authorization: `Bearer ${token}` }, // Use token from environment variable
      }),
    
    ]);

   
    const products = responses.flatMap((response) => response.data);

  
    const product = products.find((p) => p.custom_id === productid);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
