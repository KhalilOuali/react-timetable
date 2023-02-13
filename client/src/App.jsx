import React, { useEffect, useState } from "react";
import {
	createBrowserRouter,
	Link,
	RouterProvider,
	useNavigate,
	useParams,
} from "react-router-dom";
import "./style.css";

function timeRow(timeText) {
	let [h, m] = timeText.split(":");
	return h * 4 + m / 15 - 32;
}

const sessionEndRow = (session) => timeRow(session.end);
const dayEndRow = (day) => Math.max(...day.sessions.map(sessionEndRow));
const weekEndRow = (week) => Math.max(...week.map(dayEndRow)) - 1;

function SessionPane(session, i, colors, special) {
	function FirstRow() {
		if (special.includes(session.type)) {
			return <div className="specialLabel">{session.type}</div>;
		} else if (session.type === "-") {
			return <div className="label">—</div>;
		} else {
			return (
				<div
					className="label"
					style={{
						gridRowStart: 2,
						gridRowEnd: session.type2 ? 3 : 4,
					}}
				>
					{session.type + " " + session.subject}
					<div className="roomLabel">{session.room}</div>
				</div>
			);
		}
	}

	function SecondRow() {
		if (special.includes(session.type)) {
			return (
				<div className="label">
					{session.subject}
					<div className="roomLabel">{session.room}</div>
				</div>
			);
		} else if (session.type2) {
			if (session.type2 === "-") {
				return <div className="label">—</div>;
			} else {
				return (
					<div className="label">
						{session.type2 + " " + session.subject2}
						<div className="roomLabel">{session.room2}</div>
					</div>
				);
			}
		} else {
			return null;
		}
	}

	function sessionBackground() {
		if (session.type2 == null) {
			return { backgroundColor: colors[session.type] };
		}

		return {
			background: `linear-gradient(120deg, ${colors[session.type]} 49.6%,
				white 49.7%, white 50.3%, ${colors[session.type2]} 50.4%)`,
		};
	}

	return (
		<div
			className="session"
			key={"session" + i}
			style={{
				gridRowStart: timeRow(session.start),
				gridRowEnd: timeRow(session.end),
				...sessionBackground(),
			}}
		>
			<div className="startTime">{session.start}</div>
			<FirstRow />
			<SecondRow />
			<div className="endTime">{session.end}</div>
		</div>
	);
}

function DayTable(day, i, rowNumber, colors, special) {
	return (
		<div
			className="dayTable"
			key={"dayTable" + i}
			style={{
				gridColumn: i + 1,
				gridTemplateRows: `2fr repeat(${rowNumber - 1}, 1fr)`,
			}}
		>
			<div className="dayName">{day.name}</div>
			{day.sessions
				? day.sessions.map((session, i) =>
						SessionPane(session, i, colors, special)
				  )
				: null}
		</div>
	);
}

function InfoPane({ info }) {
	const navigate = useNavigate();

	return (
		<div className="infoPane">
			<div className="infoClass" onClick={() => navigate("/")}>
				{info.group}
			</div>
			<div className="infoYear">{info.year}</div>
			<div className="infoSem">{info.semester}</div>
			<div className="infoVer">{info.version}</div>
		</div>
	);
}

function Timetable() {
	const { group } = useParams();
	const [data, setData] = useState(null);
	const [rowNumber, setRowNumber] = useState(null);

	useEffect(() => {
		fetch("http://localhost:3001/" + group)
			.then((res) => res.json())
			.then((resdata) => {
				setData(resdata);
				setRowNumber(weekEndRow(resdata.days));
			});
	}, []);

	return data === null ? (
		<h1>Loading...</h1>
	) : (
		<>
			<InfoPane info={data.info} />
			<div className="weekTable">
				{data.days.map((day, i) =>
					DayTable(day, i, rowNumber, data.colors, data.special)
				)}
			</div>
		</>
	);
}

function errorElement() {
	return (
		<div>
			<h1>❌ Error 404: Page not Found</h1>
			<h2>
				Invalid URL. <Link to={"/"}>Go back home.</Link>
			</h2>
		</div>
	);
}

function Home() {
	const navigate = useNavigate();

	return (
		<h1 className="homePage">
			{/* <Link to={"/G1"}>G1</Link>
			<Link to={"/G2"}>G2</Link>
			<Link to={"/G3"}>G3</Link> */}
			<div className="infoClass" onClick={() => navigate("G1")}>G1</div>·
			<div className="infoClass" onClick={() => navigate("G2")}>G2</div>·
			<div className="infoClass" onClick={() => navigate("G3")}>G3</div>
		</h1>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
		errorElement: errorElement(),
	},
	{
		path: "/:group",
		element: <Timetable />,
		errorElement: errorElement(),
	},
]);

export default function RouterView() {
	return <RouterProvider router={router} />;
}
