// Import React
import React from "react";
import styled from "styled-components";

// Import Spectacle Core tags
import {
  Appear,
  CodePane,
  Deck,
  Heading,
  Image,
  ListItem,
  List,
  Link,
  Slide,
  Text
} from "spectacle";
// Import theme
import createTheme from "spectacle/lib/themes/default";

// import { Twitter, Github } from "react-jam-icons";

// Require CSS
require("normalize.css");

const theme = createTheme({
  primary: "#0F505D",
  secondary: "#F9CC0F",
  tertiary: "#0B7678",
  heading: "#F9CC0F",
  slide: "#0B7678",
  content: "white",
  shadow: "rgba(0,0,0,0.3)",
  red: "red"
}, {
  primary: "Futura, 'Average Sans'",
  secondary: "'Brandone Grotesque', 'Average Sans'",
  title: "'Source Sans Pro'"
});

const images = {
  devoxx: require("../assets/logo-devoxx.png"),
  title: require("../assets/title-bg.png"),
  casino: require("../assets/kay-537020-unsplash.jpg"),
  charrues: require("../assets/charrues.jpg"),
  passport: require("../assets/passeport-cni.jpg"),
  bracelet: require("../assets/multiples-bracelets.jpg"),
  standards: require("../assets/standards.png")
};

const codeSamples = {
  claims: require("raw-loader!../assets/claims.example"),
  caveats: require("raw-loader!../assets/caveats.example")
};


const MyHeading = (props) => <Heading margin="0 0 20px 0" textColor="heading" {...props}/>;

const FooterWrapper = styled.div`
  z-index: 2;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  max-height: 5vh;
  color: white;
  font-family: 'Source Sans Pro';
`;

const FooterElement = styled.div`
  flex: 1 0 auto;
  padding: 0 2vw;
`;

const FooterLogo = styled.img`
  height: 5vh;
`;

const Footer = () => (
  <FooterWrapper>
    <FooterElement>
      @jutanguy
    </FooterElement>
    <FooterElement>
      #DevoxxFR
    </FooterElement>
    <div>
      <FooterLogo src={images.devoxx}/>
    </div>
  </FooterWrapper>
);

export default class Presentation extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Footer/>
        <Deck transition={["fade"]} transitionDuration={500} progress="bar" theme={theme}>
          <Slide bgImage={images.title} textColor="content">
            <Heading textColor="content" size={1} textFont="title" fit caps>
              Authentification et autorisation
              <br/>
              décentralisée
              <br/>
              avec JWT et Macaroons
            </Heading>
          </Slide>

          <Slide bgImage={images.charrues}/>

          <Slide bgColor="slide" textColor="content">
            <Image src={images.passport} width="100%"/>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={2}>
              Authentification
            </MyHeading>
            <Appear>
              <Text textColor="content">JSON Web Token</Text>
            </Appear>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit>
              Structure d'un JWT
            </MyHeading>
            <CodePane textSize="3vh" lang="json" source={codeSamples.claims}/>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit caps>
              Code
            </MyHeading>
          </Slide>


          <Slide bgColor="slide" textColor="content">
            <Image src={images.bracelet} width="100%"/>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={2}>
              Autorisation
            </MyHeading>
            <Appear>
              <Text textColor="content">Macaroon</Text>
            </Appear>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit>
              Structure d'un Macaroon
            </MyHeading>
            <CodePane textSize="3vh" lang="yaml" source={codeSamples.caveats}/>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit caps>
              Code
            </MyHeading>
          </Slide>


          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit caps>
              Comparatif
            </MyHeading>

            <List>
              <ListItem>Fermé vs Ouvert</ListItem>
              <ListItem>Claims vs Caveats</ListItem>
            </List>
          </Slide>

          <Slide bgColor="slide" textColor="content">
            <MyHeading size={1} fit caps>
              Références et liens
            </MyHeading>
            <List fit>
              <ListItem><Link to="jwt.io">jwt.io</Link></ListItem>
              <ListItem><Link to="macaroons.io">macaroons.io</Link></ListItem>
            </List>
            <List fit>
              <ListItem><Link to="https://www.youtube.com/watch?v=A2-YImhNVMU">100% Stateless avec JWT (JSON Web Token), par Hubert Sablonnière</Link></ListItem>
              <ListItem><Link to="https://www.youtube.com/watch?v=KjppXKcMm9E">Macarons, des cookies en mieux !</Link></ListItem>
            </List>
          </Slide>
        </Deck>
      </React.Fragment>
    );
  }
}
