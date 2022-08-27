import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from '@mui/material/Grid';
import Room from '@mui/icons-material/Room';
import SchoolIcon from '@mui/icons-material/School';
import { ViewState, AppointmentModel, Resource} from "@devexpress/dx-react-scheduler";
import { Scheduler, DayView, WeekView, MonthView, Appointments, Toolbar, DateNavigator, ViewSwitcher, Resources, AppointmentTooltip, TodayButton, CurrentTimeIndicator } from "@devexpress/dx-react-scheduler-material-ui";
import classNames from "clsx";
import dino from './dino.png';

const PREFIX = "timetable";

const classes = {
  toolbarRoot: `${PREFIX}-toolbarRoot`,
  progress: `${PREFIX}-progress`,
  line: `${PREFIX}-line`,
  circle: `${PREFIX}-circle`,
  nowIndicator: `${PREFIX}-nowIndicator`,
  text: `${PREFIX}-text`,
  title: `${PREFIX}-title`,
  content: `${PREFIX}-content`,
  container: `${PREFIX}-container`,
  icon: `${PREFIX}-icon`,
  textCenter: `${PREFIX}-textCenter`,
  dino: `${PREFIX}-dino`,
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
  [`& .${classes.dino}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 24
  }
}));

const StyledLinearProgress = styled(LinearProgress)(() => ({
  [`&.${classes.progress}`]: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
  },
}));

const StyledAppointmentsAppointmentContent = styled(Appointments.AppointmentContent)(({theme}) => ({
  [`& .${classes.text}`]: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "black"
  },
  [`& .${classes.title}`]: {
    fontWeight: "bold"
  },
  [`& .${classes.content}`]: {
    opacity: 0.8
  },
  [`& .${classes.container}`]: {
    width: "100%",
    lineHeight: 1.2,
    height: "100%"
  }
}));

const StyledAppointmentTooltipContent = styled(AppointmentTooltip.Content)(({theme}) => ({
  [`& .${classes.text}`]: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "black"
  },
  [`& .${classes.title}`]: {
    fontWeight: "bold"
  },
  [`& .${classes.content}`]: {
    opacity: 0.8
  },
  [`& .${classes.container}`]: {
    width: "100%",
    lineHeight: 1.2,
    height: "100%"
  }
}));

const StyledGrid = styled(Grid)(() => ({
  [`&.${classes.textCenter}`]: {
    textAlign: 'center',
  },
}));

const StyledRoom = styled(Room)(({ theme }) => ({
  [`&.${classes.icon}`]: {
    color: theme.palette.action.active,
  },
}));

const StyledSchoolIcon = styled(SchoolIcon)(({ theme }) => ({
  [`&.${classes.icon}`]: {
    color: theme.palette.action.active,
  },
}));

const getData = (setData: (data: Array<AppointmentModel>) => void, setLoading: (loading: boolean) => void) => {
  setLoading(true);

  return fetch("data/appointments.json")
    .then((response) => response.json())
    .then((data) => {
      setData(data);
      setLoading(false);
    });
};

const getResources = (setResources: (resources: Array<Resource>) => void, setLoading: (loading: boolean) => void) => {
  setLoading(true);

  return fetch("data/resources.json")
    .then((response) => response.json())
    .then((resources) => {
      setResources(resources);
      setLoading(false);
    });
};

const ToolbarWithLoading = ({ children, ...restProps }: Toolbar.RootProps) => (
  <StyledDiv className={classes.toolbarRoot}>
    <Toolbar.Root {...restProps}>{children}</Toolbar.Root>
    <StyledLinearProgress className={classes.progress} />
  </StyledDiv>
);

const TimeIndicator = ({ top, ...restProps }: CurrentTimeIndicator.IndicatorProps) => (
  // @ts-ignore
  <StyledDiv top={top} {...restProps}>
    <div className={classNames(classes.nowIndicator, classes.circle)} />
    <div className={classNames(classes.nowIndicator, classes.line)} />
  </StyledDiv>
);

const AppointmentContent = ({ data, ...restProps }: Appointments.AppointmentContentProps) => (
  <StyledAppointmentsAppointmentContent {...restProps} data={data}>
    <div className={classes.container}>
      <div className={classNames(classes.text, classes.title)}> {data.title} </div>
      <div className={classNames(classes.text, classes.content)}> {data.room} </div>
      <div className={classNames(classes.text, classes.content)}> {data.teacher} </div>
    </div>
  </StyledAppointmentsAppointmentContent>
);

const AppointmentTooltipContent = (({ appointmentData, ...restProps }: AppointmentTooltip.ContentProps) => (
  <StyledAppointmentTooltipContent {...restProps} appointmentData={appointmentData}>
    <Grid container alignItems="center">
      <StyledGrid item xs={2} className={classes.textCenter}>
        <StyledRoom className={classes.icon} />
      </StyledGrid>
      <Grid item xs={10}>
        <span>{appointmentData?.room}</span>
      </Grid>
    </Grid>
    {appointmentData?.teacher &&
      <Grid container alignItems="center">
        <StyledGrid item xs={2} className={classes.textCenter}>
          <StyledSchoolIcon className={classes.icon} />
        </StyledGrid>
        <Grid item xs={10}>
          <span>{appointmentData?.teacher}</span>
        </Grid>
      </Grid>
    }
  </StyledAppointmentTooltipContent>
));

type State = { 
  data: Array<AppointmentModel>; 
  resources: Array<Resource>; 
  loading: boolean; 
}

type Action =
  | { type: 'setLoading', payload: boolean }
  | { type: 'setData', payload: Array<AppointmentModel> }
  | { type: 'setResources', payload: Array<Resource> };

const initialState: State = {
  data: [],
  resources: [],
  loading: false,
};

const reducer = (state: State, action: Action): State  => {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setData":
      return { ...state, data: action.payload };
    case "setResources":
      return { ...state, resources: action.payload };
    default:
      return state;
  }
};

export default () => {
  const [{
    data,
    resources,
    loading,
    }, dispatch] = React.useReducer(reducer, initialState);

  const setData = React.useCallback(
    (nextData: Array<AppointmentModel>) =>
      dispatch({
        type: "setData",
        payload: nextData,
      }),
    [dispatch]
  );
  const setResources = React.useCallback(
    (nextData: Resource[]) =>
      dispatch({
        type: "setResources",
        payload: nextData,
      }),
    [dispatch]
  );
  const setLoading = React.useCallback(
    (nextLoading: boolean) =>
      dispatch({
        type: "setLoading",
        payload: nextLoading,
      }),
    [dispatch]
  );

  React.useEffect(() => {
    getData(setData, setLoading);
    getResources(setResources, setLoading);
  }, [setData]);

  return ( 
    <Paper>
      {/* 
      // @ts-ignore*/}
      <Scheduler data={data} locale={"de-CH"} >
        <ViewState defaultCurrentViewName="Woche" />
        <DayView name="Tag" startDayHour={8} endDayHour={16} />
        <WeekView name="Woche" startDayHour={8} endDayHour={16} excludedDays={[0, 1, 6]} />
        <MonthView name="Monat" />
        <Appointments appointmentContentComponent={AppointmentContent} />
        <AppointmentTooltip contentComponent={AppointmentTooltipContent} />
        <CurrentTimeIndicator indicatorComponent={TimeIndicator} shadePreviousCells shadePreviousAppointments />
        <Resources data={resources} mainResourceName={"subject"} />
        <Toolbar {...(loading ? { rootComponent: ToolbarWithLoading } : null)} />
        <DateNavigator />
        <TodayButton messages={ { today: "Jetzt" } } />
        <ViewSwitcher />
      </Scheduler>
      <StyledDiv>
        <div className={classes.dino}>
          <img width="156" height="156" src={dino} />
        </div>
      </StyledDiv>
    </Paper>
  );
};
