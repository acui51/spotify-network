import Playlists from "@/components/Playlists";
import OnboardModal from "@/components/OnboardModal";
import AboutModal from "@/components/AboutModal";
import { useSpotifyPlaylists } from "@/hooks/useSpotifyPlaylists";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cosineSim } from "@/utils/cosineSimilarity";
import * as d3 from "d3";
import d3Tip from "d3-tip";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";

export default function Home({ providers }) {
  const { data: session, status } = useSession();
  const { data: playlistData, loading: playlistLoading } =
    useSpotifyPlaylists(session);
  const [focusedPlaylist, setFocusedPlaylist] = useState([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
  const [isOnboardModalVisible, setIsOnboardModalVisible] = useState(true);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);

  const [selectedMetrics, setSelectedMetrics] = useState({
    acousticness: false,
    energy: false,
    instrumentalness: false,
    key: false,
    liveness: false,
    loudness: false,
    mode: false,
    speechiness: false,
    tempo: false,
    time_signature: false,
    valence: false,
  });

  const handleChange = (event) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [event.target.name]: event.target.checked,
    });
  };

  const drag = (simulation) => {
    const dragstarted = (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragended = (event) => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    };

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 5])
    // .translateExtent([
    //   [0, 0],
    //   [w + 200, h + 200],
    // ])
    .on("zoom", handleZoom);

  const drawGraph = () => {
    // Clear graph
    d3.select("#graph").html("");
    // const data = getGraphData(focusedPlaylist);
    const data = getClassifyGraphData(focusedPlaylist);
    console.log("data", data);
    const width = 600;
    const height = 600;
    
    // Create SVG
    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const group = svg.append("g");

    // Initialize the zoom
    // const { height: h, width: w } = d3
    //   .select("#graph")
    //   .node()
    //   .getBoundingClientRect();
    initZoom();

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // Add a window resize listener to make the graph responsive
    d3.select(window).on("resize", resize);
    resize();

    // Tooltip
    const tip = d3Tip()
      .attr("class", "d3-tip")
      .style("position", "fixed")
      .style("text-align", "left")
      .style("padding", "5px")
      .style("font", "12px sans-serif")
      .style("background", "white")
      .style("opacity", "0.5")
      .style("border", "1px solid gray")
      .style("border-radius", "10px")
      .style("z-index", "10")
      .html((e) => {
        console.log("e", e);
        return (
          "Track Name: " +
          e.target.__data__.id +
          "<br><br>" +
          "Artist: " +
          e.target.__data__.artist
        );
      });
    group.call(tip);

    var links = data.links;

    // Initialize the links
    const link = group
      .selectAll("line")
      .data(links)
      .join("line")
      .style("stroke", "#aaa")
      .style("stroke-width", function (d) {
        return (1 - d.value) * 100 * 3.5;
      });
    if (
      Object.values(selectedMetrics).filter((val) => !!val).length === 0 ||
      Object.values(selectedMetrics).filter((val) => !!val).length === 11
    ) {
      const link = svg
        .selectAll("line")
        .data(links)
        .join("line")
        .style("stroke", "#aaa")
        .style("stroke-width", function (d) {
          return (1 - d.value) * 100 * 3.5;
        });
    } else {
      const link = svg
        .selectAll("line")
        .data(links)
        .join("line")
        .style("stroke", "#aaa")
        .style("stroke-width", function (d) {
          console.log(d.value);
          return ((d.value - 0.9) / 0.9) * 10;
        });
    }

    // Initialize the nodes with images/colors
    const node = group
      .selectAll("image")
      .data(data.nodes)
      .join("image")
      .attr("xlink:href", (d) => d.img_url)
      .attr("width", 32)
      .attr("height", 32)
      .attr("clip-path", "inset(0% round 15px)")
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

    // const node = group
    //   .selectAll("circle")
    //   .data(data.nodes)
    //   .join("circle")
    //   .attr("r", 14)
    //   .style("fill", "#69b3a2")
    //   .on("mouseover", tip.show)
    //   .on("mouseout", tip.hide);

    // Let's list the force we wanna apply on the network
    const simulation = d3
      .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
      .force(
        "link",
        d3
          .forceLink() // This force provides links between nodes
          .id(function (d) {
            return d.id;
          }) // This provide  the id of a node
          .links(data.links) // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-200)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force(
        "center",
        d3.forceCenter((window.innerWidth - 200) / 2, window.innerHeight / 2)
      ) // This force attracts nodes to the center of the svg area
      .on("end", ticked);

    // ************* FUNCTIONS *************
    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .attr("x", function (d) {
          return d.x - 16;
        })
        .attr("y", function (d) {
          return d.y - 6;
        });
    }

    // Resizes container responsively
    function resize() {
      const { width: containerWidth, height: containerHeight } = d3
        .select("#graph")
        .node()
        .getBoundingClientRect();

      svg.attr("width", containerWidth).attr("height", containerHeight);

      xScale.range([0, containerWidth]);
      yScale.range([containerHeight, 0]);
    }

    // Initializes and handle Zoom functions
    function initZoom() {
      d3.select("svg").call(zoom);
    }
  };

  useEffect(() => {
    if (focusedPlaylist.length > 0) {
      drawGraph();
    }
  }, [focusedPlaylist]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="h-screen">
        {Object.values(providers).map((provider) => {
          return status === "unauthenticated" ? (
            <button
              key={provider.name}
              onClick={() => signIn()}
              className={
                "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded absolute top-2 right-3"
              }
            >
              Log in to {provider.name}
            </button>
          ) : (
            <button
              className={
                "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded absolute top-2 right-3"
              }
              key={provider.name}
              onClick={() => signOut()}
            >
              Log out of {provider.name}
            </button>
          );
        })}
        {status !== "unauthenticated" ? (
          <>
            <button
              className={
                "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded absolute top-2 left-3"
              }
              onClick={() => {
                setAboutModalVisible(true);
              }}
            >
              About This Tool
            </button>
            {isAboutModalVisible && (
              <AboutModal visible={setAboutModalVisible} />
            )}
            <button
              onClick={center}
              className="absolute bottom-0 border-2 border-green-500 px-4 py-2 rounded-[99999px]"
              style={{
                transform: `translate(-50%, -50%)`,
                left: "50%",
              }}
            >
              Center
            </button>

            <OnboardModal
              visible={isOnboardModalVisible}
              onCancel={() => {
                setIsModalVisible(false);
              }}
              onOkay={() => {
                setIsModalVisible(false);
              }}
            />
            <div className="text-xl flex flex-row justify-center pt-3">
              Showing Similarity Graph for: {selectedPlaylistName}
            </div>
            <div className="flex">
              <Playlists
                playlists={playlistData}
                setSelectedPlaylistName={setSelectedPlaylistName}
                setFocusedPlaylist={setFocusedPlaylist}
              />
              <div
                className="w-full h-screen overflow-y-scroll"
                id="graph"
              ></div>
              <div className="bg-white border border-gray-900 bg-opacity-80 rounded-lg m-2 px-2 pb-2 pt-1 absolute right-0 bottom-0 text-lg opacity-80 flex flex-row drop-shadow-md">
                <Box sx={{ display: "flex" }}>
                  <FormControl
                    sx={{ m: 1 }}
                    component="fieldset"
                    variant="standard"
                  >
                    <FormLabel component="legend">
                      Choose Similarity Metrics
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.acousticness}
                            onChange={handleChange}
                            name="acousticness"
                          />
                        }
                        label="acousticness"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.energy}
                            onChange={handleChange}
                            name="energy"
                          />
                        }
                        label="energy"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.instrumentalness}
                            onChange={handleChange}
                            name="instrumentalness"
                          />
                        }
                        label="instrumentalness"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.key}
                            onChange={handleChange}
                            name="key"
                          />
                        }
                        label="key"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.liveness}
                            onChange={handleChange}
                            name="liveness"
                          />
                        }
                        label="liveness"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.loudness}
                            onChange={handleChange}
                            name="loudness"
                          />
                        }
                        label="loudness"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.mode}
                            onChange={handleChange}
                            name="mode"
                          />
                        }
                        label="mode"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.speechiness}
                            onChange={handleChange}
                            name="speechiness"
                          />
                        }
                        label="speechiness"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.tempo}
                            onChange={handleChange}
                            name="tempo"
                          />
                        }
                        label="tempo"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.time_signature}
                            onChange={handleChange}
                            name="time_signature"
                          />
                        }
                        label="time_signature"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMetrics.valence}
                            onChange={handleChange}
                            name="valence"
                          />
                        }
                        label="valence"
                      />
                      <Button onClick={drawGraph}>Graph!</Button>
                    </FormGroup>
                  </FormControl>
                </Box>
                {/* <div> OLD FORM
              <form>
                <div className="font-bold text-center">Similarity Metric</div>
                {similarityTypes.map((e) => (
                  <label className="flex flex-row" key={e.value}>
                    <input
                      type="radio"
                      value={e.value}
                      checked={similarityMetric === e.value}
                      onChange={handleChange}
                    />
                    <span className="ml-2">{e.label}</span>
                  </label>
                ))}
              </form>
            </div> */}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );

  function getGraphData(tracks) {
    const graphData = { nodes: [], links: [] };
    let minWeight = 1;
    let maxWeight = 0;
    for (let i = 0; i < tracks.length; i++) {
      const trackName = tracks[i].metadata.name;
      graphData.nodes.push({
        id: trackName,
        artist: tracks[i].metadata.artists[0]["name"],
        group: 1,
        img_url: tracks[i].metadata.album.images?.[0].url,
      });
      const trackFeature = [];
      for (let key of Object.keys(selectedMetrics)) {
        if (
          selectedMetrics[key] ||
          Object.values(selectedMetrics).filter((val) => !!val).length === 0
        )
          trackFeature.push(tracks[i].features[key]);
      }

      for (let j = i + 1; j < tracks.length; j++) {
        const compTrackFeature = [];
        const compTrackName = tracks[j].metadata.name;
        for (let key of Object.keys(selectedMetrics)) {
          if (
            selectedMetrics[key] ||
            Object.values(selectedMetrics).filter((val) => !!val).length === 0
          )
            compTrackFeature.push(tracks[j].features[key]);
        }
        const weight = cosineSim(trackFeature, compTrackFeature);
        minWeight = Math.min(minWeight, weight);
        maxWeight = Math.max(maxWeight, weight);
        graphData.links.push({
          source: trackName,
          target: compTrackName,
          value: weight,
        });
      }
    }

    // normalize weights
    for (let i = 0; i < graphData.links.length; i++) {
      const link = graphData.links[i];
      link.value = (link.value - minWeight) / (maxWeight - minWeight);
    }

    // filter for only strong relations
    graphData.links = graphData.links.filter((link) => link.value > 0.99);

    console.log("graphData", graphData);
    return graphData;
  }

  function getClassifyGraphData(tracks) {
    console.log("in classify");
    const graphClassifyData = { nodes: [], links: [] };
    graphClassifyData.nodes.push({
      id: "Spotify",
      group: 1,
      img_url: "https://i0.wp.com/wdevradio.com/wp-content/uploads/2021/09/Spotify-logo-cropped.jpg?ssl=1",
    });
    for (let i = 0; i < tracks.length; i++) {
      const artists = tracks[i].metadata.artists;
      const trackName = tracks[i].metadata.name;
      if (Array.isArray(artists)) {
        artists.forEach((artist) => {
          const artistName = artist.name; 
          graphClassifyData.nodes.push({
            id: trackName,
            group: 3,
            img_url: tracks[i].metadata.album.images?.[0].url,
          });
          graphClassifyData.nodes.push({
            id: artistName,
            group: 2,
            img_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Location_dot_black.svg/800px-Location_dot_black.svg.png",
          });
          graphClassifyData.links.push({
            source: artistName,
            target: trackName,
            value: 2,
          });
          graphClassifyData.links.push({
            source: artistName,
            target: "Spotify",
            value: 3,
          })
        });
      } else {
        graphClassifyData.links.push({
          source: tracks[i].metadata.artists[0]["name"],
          target: trackName,
          value: 2,
        });
        graphClassifyData.links.push({
          source: tracks[i].metadata.artists[0]["name"],
          target: "Spotify",
          value: 3,
        })
      }
    }
    console.log("classified data", graphClassifyData);
    return graphClassifyData;
  }

  function handleZoom(e) {
    d3.select("svg g").attr("transform", e.transform);
  }

  // Centers the graph
  function center() {
    const { width, height } = d3
      .select("#graph")
      .node()
      .getBoundingClientRect();
    d3.select("svg")
      .transition()
      .call(zoom.translateTo, 0.5 * width, 0.5 * height);
  }
}

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
