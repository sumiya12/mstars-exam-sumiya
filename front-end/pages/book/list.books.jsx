import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import axios from "axios";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Button,
  Link,
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
  const [openDel, setOpenDel] = React.useState(false);
  const [id, setId] = useState();
  const handleOpen = () => setOpen(true);
  const handleOpenDel = (e) => {
    setOpenDel(true);
  };
  const handleClose = () => setOpen(false);
  const handleCloseDel = () => setOpenDel(false);

  const crudsApi = `https://sumiya.ilearn.mn/book/get`;
  const fetcher = async (url) =>
    await axios.get(url).then((res) => res.data.data);
  const { data, error } = useSWR(crudsApi, fetcher);

  const handledelete = (e) => {
    axios
      .delete(`https://sumiya.ilearn.mn/book/delete/${e}`)
      .then((res) => {
        if (res.status === 200) {
          console.log("orj irsen");
          location.reload();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const commonStyles = {
    bgcolor: "background.paper",
    // m: 1,
    borderColor: "text.primary",
    // width: "5rem",
    height: "5rem",
  };
  return (
    <>
      <TableContainer
        component={Paper}
        style={{
          flexDirection: "column",
          display: "flex",

          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow sx={{ ...commonStyles, borderBottom: 2 }}>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                #{" "}
              </StyledTableCell>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                Name
              </StyledTableCell>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                Price
              </StyledTableCell>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                Author
              </StyledTableCell>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                ISBN
              </StyledTableCell>
              <StyledTableCell
                sx={{ ...commonStyles, borderBottom: 1, fontWeight: "bold" }}
                align="center"
              >
                Published On
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data &&
              data.map((e, i) => {
                return (
                  <StyledTableRow key={i}>
                    <StyledTableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {i + 1}
                    </StyledTableCell>

                    <StyledTableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {e?.name}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "light", m: 1 }}
                    >
                      {e?.price}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "light", m: 1 }}
                    >
                      {e?.author}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "light", m: 1 }}
                    >
                      {e?.ISBN}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "light", m: 1 }}
                    >
                      {moment().format("YYYY-MM-DD", e?.published_date)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Button>
                        <Link href={`/book/edit/${e._id}`}>
                          <EditIcon style={{ color: "grey" }} />
                        </Link>
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Button onClick={() => handledelete(e._id)}>
                        <DeleteForeverIcon style={{ color: "grey" }} />
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <div
        style={{
          width: "100vw",
          //   alignItems: "center",
          padding: "20px",
          margin: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          style={{
            alignContent: "center",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            borderRadius: "none",
          }}
          onClick={handleOpen}
        >
          <AddIcon /> add book
        </Button>
        <AddBook handleClose={handleClose} open={open} />
      </div>
    </>
  );
};

export default ListBooks;
