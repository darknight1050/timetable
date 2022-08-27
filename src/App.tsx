import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import { ViewState } from "@devexpress/dx-react-scheduler";
import { Scheduler, WeekView, DayView, Appointments, Toolbar, DateNavigator, ViewSwitcher, Resources, AppointmentTooltip, TodayButton, CurrentTimeIndicator } from "@devexpress/dx-react-scheduler-material-ui";
import classNames from "clsx";

const PREFIX = "Demo";

const classes = {
  toolbarRoot: `${PREFIX}-toolbarRoot`,
  progress: `${PREFIX}-progress`,
  line: `${PREFIX}-line`,
  circle: `${PREFIX}-circle`,
  nowIndicator: `${PREFIX}-nowIndicator`,
};
// @ts-ignore
const StyledDiv = styled("div", { shouldForwardProp: (prop) => prop !== "top" })(({ theme, top }) => ({
  [`&.${classes.toolbarRoot}`]: {
    position: "relative",
  },
  [`& .${classes.line}`]: {
    height: "2px",
    borderTop: `2px ${theme.palette.primary.main} dotted`,
    width: "100%",
    transform: "translate(0, -1px)",
  },
  [`& .${classes.circle}`]: {
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    background: theme.palette.primary.main,
  },
  [`& .${classes.nowIndicator}`]: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    top,
  },
}));

const StyledLinearProgress = styled(LinearProgress)(() => ({
  [`&.${classes.progress}`]: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
  },
}));

const ToolbarWithLoading = // @ts-ignore
  ({ children, ...restProps }) => (
    <StyledDiv className={classes.toolbarRoot}>
      <Toolbar.Root {...restProps}>{children}</Toolbar.Root>
      <StyledLinearProgress className={classes.progress} />
    </StyledDiv>
  );

const initialState = {
  data: [],
  loading: false,
  currentViewName: "Tag",
};

// @ts-ignore
const reducer = (state, action) => {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setData":
      return { ...state, data: action.payload };
    case "setResources":
      return { ...state, resources: action.payload };
    case "setCurrentViewName":
      return { ...state, currentViewName: action.payload };
    default:
      return state;
  }
};

// @ts-ignore
const getData = (setData, setLoading) => {
  setLoading(true);

  return fetch("data/appointments.json")
    .then((response) => response.json())
    .then((data) => {
      setData(data);
      setLoading(false);
    });
};

// @ts-ignore
const getResources = (setResources, setLoading) => {
  setLoading(true);

  return fetch("data/resources.json")
    .then((response) => response.json())
    .then((resources) => {
      setResources(resources);
      setLoading(false);
    });
};

const TimeIndicator = ({
  // @ts-ignore
  top,
  ...restProps
}) => (
  // @ts-ignore
  <StyledDiv top={top} {...restProps}>
    {/*
 // @ts-ignore */}
    <div className={classNames(classes.nowIndicator, classes.circle)} />
    {/*
     // @ts-ignore */}
    <div className={classNames(classes.nowIndicator, classes.line)} />
  </StyledDiv>
);

export default () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { data, resources, loading, currentViewName, mainResourceName = "subject", locale = "de-CH" } = state;
  const setCurrentViewName = React.useCallback(
    // @ts-ignore
    (nextViewName) =>
      dispatch({
        type: "setCurrentViewName",
        payload: nextViewName,
      }),
    [dispatch]
  );
  const setData = React.useCallback(
    // @ts-ignore
    (nextData) =>
      dispatch({
        type: "setData",
        payload: nextData,
      }),
    [dispatch]
  );
  const setResources = React.useCallback(
    // @ts-ignore
    (nextData) =>
      dispatch({
        type: "setResources",
        payload: nextData,
      }),
    [dispatch]
  );
  const setLoading = React.useCallback(
    // @ts-ignore
    (nextLoading) =>
      dispatch({
        type: "setLoading",
        payload: nextLoading,
      }),
    [dispatch]
  );

  React.useEffect(() => {
    getData(setData, setLoading);
    getResources(setResources, setLoading);
  }, [setData, currentViewName]);

  return (
    <Paper>
      {" "}
      {/*
     // @ts-ignore */}
      <Scheduler data={data} locale={locale}>
        <ViewState currentViewName={currentViewName} onCurrentViewNameChange={setCurrentViewName} />
        <DayView name="Tag" startDayHour={8} endDayHour={16} />
        <WeekView name="Woche" startDayHour={8} endDayHour={16} />
        <Appointments />
        <AppointmentTooltip />
        {/*
     // @ts-ignore */}
        <CurrentTimeIndicator indicatorComponent={TimeIndicator} shadePreviousCells shadePreviousAppointments />
        <Resources data={resources} mainResourceName={mainResourceName} />
        {/*
        // @ts-ignore */}
        <Toolbar {...(loading ? { rootComponent: ToolbarWithLoading } : null)} />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
      </Scheduler>
    </Paper>
  );
};
