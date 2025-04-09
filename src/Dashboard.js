import './Dashboard.css'
import { MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import markerIcon from "../node_modules/leaflet/dist/images/marker-icon.png"
import L, { marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
const Dashboard = () =>{

    const icon = new L.Icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon,
        popupAnchor: [-0,-0],
        iconSize: [21,30]
    })

    var locations = [
        { name: "Big Sioux River and I-90", coords: [43.610255, -96.744512] },
        { name: "Big Sioux River @ Timberline", coords: [43.599904, -96.653107] },
        { name: "Big Sioux River @ BAhson", coords: [43.569820, -96.684398] },
        { name: "Skunk Creek @ Marion Road", coords: [43.533928, -96.791001] },
        { name: "Big Sioux @ Falls Park", coords: [43.557252, -96.722152] }
    ];

    return (
        <div>
            <h2>Visualization Dashboard</h2>

            <div className="charts-container">
                <div className="chart-box">
                    <h3>Interactive Map</h3>
                    <MapContainer id='map' center={[43.5, -96.7]} zoom={10} preferCanvas={true} zoomAnimation={false} inertia={true}>
                        <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        detectRetina={true}
                        maxZoom={18}/>
                        {locations.map((marker,index) => (
                            <Marker position={marker.coords} icon={icon}>
                                <Popup>{marker.name}<br/>
                                Location {index + 1}</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                <div className="chart-box">
                    <img src="./images/chart1.png" alt="Time Series Chart" className="chart-image"/>
                </div>
                <div className="chart-box">
                    <img src="./images/chart2.png" alt="Time Series Chart" className="chart-image"/>
                </div><div className="chart-box">
                    <img src="./images/chart3.png" alt="Time Series Chart" className="chart-image"/>
                </div><div className="chart-box">
                    <img src="./images/chart4.png" alt="Time Series Chart" className="chart-image"/>
                </div><div className="chart-box">
                    <img src="./images/chart5.png" alt="Time Series Chart" className="chart-image"/>
                </div>
            </div>

        </div>
    )
}

export default Dashboard;