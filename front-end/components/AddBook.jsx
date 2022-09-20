import * as React from "react";
import { Button, Box, Typography, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Modal from "@mui/material/Modal";
import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  const [value, setValue] = useState(dayjs(null));

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    axios
      .post("https://sumiya.ilearn.mn/book/create", {
        name: e.target.name.value,
        price: e.target.price.value,
        author: e.target.author.value,
        ISBN: e.target.isbn.value,
        published_date: value,
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
              gap: 3,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            onSubmit={submitHandler}
          >
            <Typography>Add Book</Typography>

            <TextField
              label="Name"
              name="name"
              style={{ width: 300 }}
            ></TextField>
            <TextField
              label="Price"
              name="price"
              style={{ width: 300 }}
            ></TextField>
            <TextField
              label="Auhtor"
              name="author"
              style={{ width: 300 }}
            ></TextField>
            <TextField
              label="ISBN"
              name="isbn"
              style={{ width: 300 }}
            ></TextField>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Published On"
                style={{ width: 300, borderColor: "" }}
                name="date"
                inputFormat="YYYY/MM/DD"
                value={value}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

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
