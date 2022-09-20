import React from "react";
import { styled } from "@mui/material/styles";
import axios from "axios";
import moment from "moment";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Button,
  Link,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import useSWR from "swr";
import AddBook from "../../components/AddBook";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ListBooks = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const crudsApi = `http://localhost:3000/book/get`;
  const fetcher = async (url) =>
    await axios.get(url).then((res) => res.data.data);
  const { data, error } = useSWR(crudsApi, fetcher);

  const handledelete = (e) => {
    axios
      .delete(`http://localhost:3000/book/delete/${e}`)
      .then((res) => {
        if (res.status === 200) {
          location.reload();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <>
      <TableContainer
        component={Paper}
        style={{
          flexDirection: "column",
          display: "flex",
          // padding: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Book Application</Typography>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center"># </StyledTableCell>
              <StyledTableCell align="center">Name</StyledTableCell>
              <StyledTableCell align="center">Price</StyledTableCell>
              <StyledTableCell align="center">Author</StyledTableCell>
              <StyledTableCell align="center">ISBN</StyledTableCell>
              <StyledTableCell align="center">Published On</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data &&
              data.map((e, i) => {
                return (
                  <StyledTableRow key={i}>
                    <StyledTableCell align="center">{i + 1}</StyledTableCell>

                    <StyledTableCell align="center">{e?.name}</StyledTableCell>
                    <StyledTableCell align="center">{e?.price}</StyledTableCell>
                    <StyledTableCell align="center">
                      {e?.author}
                    </StyledTableCell>
                    <StyledTableCell align="center">{e?.ISBN}</StyledTableCell>
                    <StyledTableCell align="center">
                      {moment().format("YYYY-MM-DD", e?.published_date)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button>
                        <Link href={`/book/edit/${e._id}`}>edit</Link>
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        onClick={() => {
                          handledelete(e._id);
                        }}
                      >
                        delete
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
          </TableBody>
        </Table>
        <Button variant="contained" onClick={handleOpen}>
          + add book
        </Button>
        <AddBook handleClose={handleClose} open={open} />
      </TableContainer>
    </>
  );
};

export default ListBooks;
