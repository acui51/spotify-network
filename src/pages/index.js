import Playlists from "@/components/Playlists";
import { useSpotifyPlaylists } from "@/hooks/useSpotifyPlaylists";
import styles from "@/styles/Home.module.css";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cosineSim } from "@/utils/cosineSimilarity";
import * as d3 from "d3";
import d3Tip from "d3-tip";

const similarityTypes = [
  { value: 'all', label: 'all' },
  { value: 'acousticness', label: 'acousticness' },
  { value: 'energy', label: 'energy' },
  { value: 'instrumentalness', label: 'instrumentalness' },
  { value: 'key', label: 'key' },
  { value: 'liveness', label: 'liveness' },
  { value: 'loudness', label: 'loudness' },
  { value: 'mode', label: 'mode' },
  { value: 'speechiness', label: 'speechiness' },
  { value: 'tempo', label: 'tempo' },
  { value: 'time_signature', label: 'time signature' },
  { value: 'valence', label: 'valence' },
];

export default function Home({ providers }) {
  const { data: session, status } = useSession();
  const { data: playlistData, loading: playlistLoading } =
    useSpotifyPlaylists(session);
  const [focusedPlaylist, setFocusedPlaylist] = useState([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("")
  const [similarityMetric, setSimilarityMetric] = useState("all")

  const handleChange = (event) => {
    if (controlEnabled) {
      setSimilarityMetric(event.target.value);
    }
    // resetSelections();
  };

  useEffect(() => {
    if (focusedPlaylist.length > 0) {
      // Clear graph
      d3.select("#graph").html("");
      const data = getGraphData(focusedPlaylist);
      console.log("data", data);
      const width = 600;
      const height = 600;

      // Create SVG
      const svg = d3
        .select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const xScale = d3.scaleLinear().range([0, width]);
      const yScale = d3.scaleLinear().range([height, 0]);

      // Add a window resize listener to make the graph responsive
      d3.select(window).on("resize", resize);

      // Tooltip
      const tip = d3Tip()
        .attr("class", "d3-tip")
        .html((e) => {
          return e.target.__data__.id;
        });
      svg.call(tip);

      var links = data.links

      // Initialize the links
      const link = svg
        .selectAll("line")
        .data(links)
        .join("line")
        .style("stroke", "#aaa")
        .style("stroke-width", function (d) { return ((1 - d.value) * 100 * 3.5); });

      // Initialize the nodes
      const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 14)
        .style("fill", "#69b3a2")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

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
          .attr("cx", function (d) {
            return d.x + 6;
          })
          .attr("cy", function (d) {
            return d.y - 6;
          });
      }

      function resize() {
        const containerWidth = d3
          .select("#graph")
          .node()
          .getBoundingClientRect().width;
        const containerHeight = containerWidth * (height / width);

        svg.attr("width", containerWidth).attr("height", containerHeight);

        xScale.range([0, containerWidth]);
        yScale.range([containerHeight, 0]);

        // update the positions of the nodes and links
      }
      resize();
    }
  }, [focusedPlaylist]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={styles.main}>
        {Object.values(providers).map((provider) => {
          return status === "unauthenticated" ? (
            <button key={provider.name} onClick={() => signIn()}>
              Log in to {provider.name}
            </button>
          ) : (
            <button className={'bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded absolute top-2 right-3'} key={provider.name} onClick={() => signOut()}>
              Log out of {provider.name}
            </button>
          );
        })}
        <div className='text-xl flex flex-row justify-center pt-3'>
          Showing Similarity Graph for: {selectedPlaylistName}
        </div>
        <div className="flex">
          <Playlists
            playlists={playlistData}
            setSelectedPlaylistName={setSelectedPlaylistName}
            setFocusedPlaylist={setFocusedPlaylist}
          />
          <div className="w-full">
            <div id="graph"></div>
          </div>
          <div className='bg-white border border-gray-900 bg-opacity-80 rounded-lg m-2 px-2 pb-2 pt-1 absolute right-0 bottom-0 text-lg opacity-80 flex flex-row drop-shadow-md'>
            <div>
              <form>
                <div className='font-bold text-center'>
                  Similarity Metric
                </div>
                {similarityTypes.map(e => (
                  <label className='flex flex-row' key={e.value}>
                    <input type='radio' value={e.value} checked={similarityMetric === e.value} onChange={handleChange} />
                    <span className='ml-2'>{e.label}</span>
                  </label>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function getGraphData(tracks) {
    const graphData = { nodes: [], links: [] };
    let minWeight = 1;
    let maxWeight = 0;
    for (let i = 0; i < tracks.length; i++) {
      const trackName = tracks[i].metadata.name;
      graphData.nodes.push({ id: trackName, group: 1 });
      const trackFeature = tracks[i].features;
      for (let j = i + 1; j < tracks.length; j++) {
        const compTrackName = tracks[j].metadata.name;
        const compTrackFeature = tracks[j].features;
        const weight = cosineSim(
          Object.values(trackFeature),
          Object.values(compTrackFeature)
        );
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
}

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
