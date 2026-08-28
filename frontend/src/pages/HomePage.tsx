import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/Product"
import { useEffect, useState, type ComponentType } from "react";
import { BASE_URL } from "../constants/baseUrl"

type ProductCardProps = {
  id: string;
  title: string;
  image: string;
  price: string;
};

const TypedProductCard = ProductCard as unknown as ComponentType<ProductCardProps>;

const HomePage = () => {
  const [products,setProducts] = useState<Product[]>([]);
  const [error,setError] = useState(false);

  useEffect(()=> {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product`); 
        const data = await response.json();
        console.log(data); //ماذا أرجع السيرفر فعليًا؟
        setProducts(data);
      }catch {
        setError(true);
      }
    };
    fetchData();
  },[])

  if(error) {
    return <Box>Something went wrong, please try again!</Box>
  }

  return (
    <Container sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {products.map(({_id,title,image,price})=> (
        <Grid size={{ md: 4 }} key={_id}>
          <TypedProductCard id={_id} title={title} image={image} price={price}/>
        </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
