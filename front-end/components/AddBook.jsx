import * as React from "react";
import { Button, Box, Typography, TextField } from "@mui/material";
import Modal from "@mui/material/Modal";
import axios from "axios";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddBook = ({ handleClose, open }) => {
  const [startDate, setStartDate] = useState(new Date());
  const submitHandler = (e) => {
    e.preventDefault();

    console.log(e.target.date.value);
    axios
      .post("http://localhost:3000/book/create", {
        name: e.target.name.value,
        price: e.target.price.value,
        auhtor: e.target.author.value,
        ISBN: e.target.isbn.value,
        published_date: e.target.date.value,
      })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          console.log("amjilltai");
          location.reload();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            component="form"
            sx={{
              backgroundColor: "white",
              color: "black",
              display: "flex",
              padding: 10,
              borderRadius: "16px",
              gap: 5,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            onSubmit={submitHandler}
          >
            <Typography>Add Book</Typography>

            <TextField label="Name" name="name"></TextField>
            <TextField label="Price" name="price"></TextField>
            <TextField label="Auhtor" name="author"></TextField>
            <TextField label="ISBN" name="isbn"></TextField>
            <DatePicker
              name="date"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
            <Button variant="contained" type="submit">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AddBook;
