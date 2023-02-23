import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import customFetch from "../../utils/axios";
import authHeader from "../../utils/userAuthHeaders";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Wrapper from "./form.style";
import { DownloadIcon } from "../../icons";

import {
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Box,
  Radio,
  RadioGroup,
  Typography,
  Checkbox,
  FormGroup,
  Grid,
  InputLabel,
  Tooltip,
} from "@mui/material";

import MemberDetail from "./member-detail";
import { CircularLoader } from "..";

const ViewFormApplication = () => {
  // getting the document
  const { formId } = useParams();
  const navigate = useNavigate();
  const { position, token } = useSelector((store) => store.user.user);
  // console.log("userPos", position);
  // console.log(formId);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState({comment: '', verdict: ''});
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        // console.log(token);
        const resp = await customFetch.get(
          `/form/getform/${formId}`,
          authHeader(token)
        );
        setEvent(resp.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        toast.error(err.message);
      }
    };
    fetchForm();
    // eslint-disable-next-line
  }, []);
  const handleComment = async () => {
    setIsLoading(true);
    await customFetch.post(
      "/evaluator/addcomment",
      { formId, comment },
      authHeader(token)
    );
    setComment({comment: '', verdict: ''});
    setIsLoading(false);
    toast.success("Comment added successfully !");
  };
  const PDFutil = async () => {
    try {
      const tokenObj = localStorage.getItem("user");
      console.log("loading starts ....");
      const resp = await customFetch.post(
        "/printapplication",
        { baseUrl: `/view/${formId}`, tokenObj },
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
            authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(resp);
      return resp;
    } catch (err) {
      console.log("error in pdf util = ", err);
    }
  };
  const handlePDFDownload = async () => {
    try {
      setIsLoading(true);
      const response = await PDFutil();
      const blob = new Blob([response.data], { type: "application/pdf" });
      setIsLoading(false);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${event.name}-application.pdf`;
      link.click();
    } catch (err) {
      setIsLoading(false);
      toast.error("Something went wrong while downloading PDF");
      console.log(err);
    }
  };
  const handleStatus = async (status) => {
    try {
      setIsLoading(true);
      await customFetch.post(
        "/evaluator/update",
        { applicantId: formId, status },
        authHeader(token)
      );
      setIsLoading(false);
      toast.success("Status updeted successfully !");
      navigate("/superadmin");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Something went wrong !");
    }
  };

  const handleRevert = async () => {
    try {
      setIsLoading(true);
      const resp = await customFetch.post(
        "/evaluator/revert",
        { applicantId: formId },
        authHeader(token)
      );
      setIsLoading(false);
      toast.success(resp.data.msg);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      toast.error("Something went wrong while reverting application !");
    }
  };

  if (!event || isLoading) {
    return <CircularLoader />;
  }
  return (
    <Wrapper sx={{ width: { lg: "75%", md: "80%", sm: "85%", xs: "95%" } }}>
      <Tooltip title="Download PDF">
        <DownloadIcon
          id="print-button"
          sx={{
            position: "absolute",
            top: "25px",
            right: "45px",
            transform: "scale(2)",
            fill: "#6e6ee5",
            cursor: "pointer",
            "@media(max-width: 750px)": {
              position: "relative",
              right: "0px",
              marginBottom: "1em",
            },
          }}
          onClick={handlePDFDownload}
        />
      </Tooltip>
      <Box>
        <Typography variant="h2" gutterBottom align="center">
          APPLICATION FORM TO ACCESS THE NVCTI LAB
        </Typography>
        {/* <Typography variant="h5" gutterBottom align="center">
          (Please fill and submit your application to NVCTI office)
        </Typography> */}
      </Box>
      <Paper className="column-center" sx={{ my: 2, p: 2 }}>
        <Typography>
          <span className="boldTypo">Application Category*</span> (✓ tick the
          appropriate)
        </Typography>
        <RadioGroup
          row
          aria-labelledby="application-category-radio"
          name="row-radio-buttons-group"
          value={event.category}
        >
          <FormControlLabel
            value="Commercial"
            control={<Radio />}
            label="Commercial"
            disabled
          />
          <FormControlLabel
            value="R&D Institute"
            control={<Radio />}
            label="R&D Institute"
            disabled
          />
          <FormControlLabel
            value="Research Student (Internal/External)"
            control={<Radio />}
            label="Research Student (Internal/External)"
            disabled
          />
          <FormControlLabel
            value="Internal UG/PG students"
            control={<Radio />}
            label="Internal UG/PG Students"
            disabled
          />
        </RadioGroup>
        <Typography sx={{ mt: 3 }}>
          <span className="boldTypo">NVTIL UNIT whose access is requested</span>{" "}
          (✓ tick the appropriate)
        </Typography>
        <FormGroup row sx={{ gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={event.unit.includes(
                  "Mechanical and Rapid Prototyping Unit"
                )}
              />
            }
            label="Mechanical and Rapid Prototyping Unit"
            disabled
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  event.unit &&
                  event.unit.includes("Electronics Circuits and IoT Unit")
                }
              />
            }
            label="Electronics Circuits and IoT Unit"
            disabled
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  event.unit &&
                  event.unit.includes("Gaming and Animation Design Unit")
                }
              />
            }
            label="Gaming and Animation Design Unit"
            disabled
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  event.unit &&
                  event.unit.includes("Pouch Battery Cell Assembly Unit")
                }
              />
            }
            label="Pouch Battery Cell Assembly Unit"
            disabled
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  event.unit &&
                  event.unit.includes("Robotics and Automation Unit")
                }
              />
            }
            label="Robotics and Automation Unit"
            disabled
          />
        </FormGroup>
      </Paper>
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <span className="boldTypo">Name of the Applicant </span>
              (Name of Team Leader in case of Team)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="name"
              type="text"
              required
              fullWidth
              color="primary"
              value={event.name}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="leader-gender-select">Gender</InputLabel>
              <Select
                labelId="leader-gender-select"
                id="demo-simple-select"
                name="gender"
                value={event.gender}
                label="Gender"
                fullWidth
                disabled
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography>
              <span className="boldTypo">Admission No.</span> (For
              Students)/Emp. No. (for faculty and staff) / Aadhar No (for
              externals)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              size="small"
              name="uniqueId"
              type="text"
              value={event.uniqueId}
              required
              fullWidth
              label="Admission No."
              color="primary"
              disabled
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="institute"
              type="text"
              value={event.institute}
              required
              fullWidth
              label="Department/Institute/Organization"
              color="primary"
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="address"
              type="text"
              value={event.address}
              required
              fullWidth
              label="Address (IIT (ISM) students should write the Hostel address )"
              color="primary"
              disabled
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="email"
              type="email"
              value={event?.contact?.email}
              required
              fullWidth
              label="Email Id"
              color="primary"
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              name="mobile"
              type="number"
              value={event?.contact?.mobile}
              required
              fullWidth
              label="Mobile Number"
              color="primary"
              disabled
            />
          </Grid>
        </Grid>
        <Grid continer spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              alt="leader"
              src={event.imgUrl}
              style={{
                width: "250px",
                height: "200px",
                border: "2px solid #c6c3c373",
              }}
            />
          </Box>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <TextField
              name="sourceOfFunding"
              value={event.sourceOfFunding}
              label="Source of Funding (For category I to III):"
              multiline
              fullWidth
              disabled
              rows={4}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="projectTitle"
              value={event.projectTitle}
              label="Title of the Project"
              multiline
              fullWidth
              disabled
              rows={4}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="projectObjective"
              value={event.projectObjective}
              label="Objective of the Project (Max. two sentences)"
              multiline
              fullWidth
              disabled
              rows={4}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 5, letterSpacing: "1.1px" }}>
          <Typography>
            <span className="boldTypo">Pitch/Idea of the Project</span>{" "}
            (Describe in brief the concept and expected outcome of the project
            (Attach extra sheet if needed) A PDF file describing the background
            (origin of idea), Concepts involved, Method and Expected outcome,
            needs to attached by category I, II and III applicants.
          </Typography>
          <Grid container spacing={2} sx={{ my: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="origin"
                value={event?.ideaOfProject?.origin}
                label="Origin of the Idea (Max. five sentences)"
                multiline
                fullWidth
                disabled
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="methodology"
                value={event?.ideaOfProject?.methodology}
                label="Methodology (Max. five sentences)"
                multiline
                fullWidth
                disabled
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="outcome"
                value={event.ideaOfProject.outcome}
                label="Expected Outcome (Max. five sentences)"
                multiline
                fullWidth
                disabled
                rows={4}
              />
            </Grid>
          </Grid>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              type="text"
              name="timeOfCompletion"
              value={event.timeOfCompletion}
              required
              disabled
              fullWidth
              label="Expected time to complete the Project (in months)"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              type="text"
              name="mentor"
              disabled
              value={event.mentor}
              required
              fullWidth
              label="Name of the Mentor (if any)"
              color="primary"
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ mt: 4, p: 3 }}>
        <TextField
          label="Number of team members"
          variant="outlined"
          type="number"
          disabled
          value={event?.member?.length}
        />
        {!!event.member.length &&
          [...Array(event.member.length)].map((_, idx) => (
            <MemberDetail key={idx} member={event.member[idx]} />
          ))}
      </Paper>
      {position === 2 && (
        <Paper sx={{ m: 2, p: 3, display: 'flex', gap: 5 }}>
          <Box sx={{width: '50%'}}>
            <Typography variant="h4" gutterBottom align="left">
              Add Comment -
            </Typography>
            <TextField
              name="comment"
              value={comment.comment}
              onChange={(e) => setComment({...comment, comment: e.target.value})}
              label="Comment will be visible to super admin (optional) "
              multiline
              fullWidth
              rows={4}
            />
            <Button variant="contained" onClick={handleComment} sx={{ m: 2 }}>
              Add Comment
            </Button>
          </Box>
          <Box sx={{width: '50%'}}>
            <Typography variant="h4" gutterBottom align="left">
              Recommendation -
            </Typography>
            <TextField
              name="verdict"
              value={comment.verdict}
              onChange={(e) => setComment({...comment, verdict: e.target.value})}
              label="Recommended/Not recommended"
              multiline
              fullWidth
              required
              rows={4}
            />
            <Button variant="contained" onClick={handleComment} sx={{ m: 2 }}>
              Add Review
            </Button>
          </Box>
        </Paper>
      )}
      {position === 3 && (
        <Paper sx={{ m: 2, p: 3 }}>
          <Typography variant="h5" gutterBottom align="left">
            Mentors' Comments -
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {console.log(event)}
            {event.mentorVerdict.map((u, idx) => (
              <Paper
                key={idx}
                sx={{
                  width: { lg: "30%", sm: "45%", xs: "90%" },
                  m: 2,
                  p: 2,
                  height: "max-content",
                  boxShadow: "var(--shadow-2)",
                  backgroundColor: "#f9f1e66c",
                }}
              >
                <span className="verdict-span">Comment: </span>{u.comments}
                <br />
                <span className="verdict-span">Recommendation: </span>{u.result}
              </Paper>
            ))}
          </Box>
        </Paper>
      )}
      {position === 3 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            sx={{ m: 1 }}
            color="secondary"
            onClick={handleRevert}
          >
            Revert to mentor
          </Button>
          <Button
            variant="contained"
            sx={{ m: 1 }}
            color="error"
            onClick={() => handleStatus("REJECTED")}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            sx={{ m: 1 }}
            color="success"
            onClick={() => handleStatus("ACCEPTED")}
          >
            Accept
          </Button>
        </Box>
      )}
    </Wrapper>
  );
};

export default ViewFormApplication;
