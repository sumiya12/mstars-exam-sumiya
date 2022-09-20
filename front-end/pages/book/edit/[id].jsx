import React from "react";
import axios from "axios";
import useSWR from "swr";
import { Button, Box, Typography, TextField } from "@mui/material";
import { useRouter } from "next/router";
import moment from "moment";

const EditPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const crudById = `https://sumiya.ilearn.mn/book/getbyid/${id}`;
  const fetcher = async (url) =>
    await axios.get(url).then((res) => res.data.data);
  const { data, error } = useSWR(crudById, fetcher);

  const submitHandler = (e) => {
    e.preventDefault();

    axios
      .put(`https://sumiya.ilearn.mn/book/update?id=${id}`, {
        name: e.target.name.value,
        price: e.target.price.value,
        author: e.target.author.value,
        ISBN: e.target.isbn.value,
        published_date: e.target.published_date.value,
      })
      .then((res) => {
        if (res.status == 200) {
          router.push("/book/list.books");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return data ? (
    <Box
      component="form"
      style={{
        backgroundColor: "white",
        color: "black",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
      }}
      onSubmit={submitHandler}
    >
      <Typography>Edit</Typography>
      <TextField
        label="Name"
        defaultValue={data && data?.name}
        name="name"
      ></TextField>
      <TextField
        label="Price"
        defaultValue={data && data?.price}
        name="price"
      ></TextField>
      <TextField
        label="Author"
        defaultValue={data && data?.author}
        name="author"
      ></TextField>
      <TextField
        label="ISBN"
        defaultValue={data && data?.ISBN}
        name="isbn"
      ></TextField>
      <TextField
        label="Published Date"
        defaultValue={
          data && moment().format("YYYY-MM-DD", data?.published_date)
        }
        name="published_date"
      ></TextField>
      <Button variant="contained" type="submit">
        Save
      </Button>
    </Box>
  ) : null;
};

export default EditPage;
