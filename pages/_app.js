import '../styles/globals.css'
import CustomHead from '../components/CustomHead'
import Footer from '../components/Footer.tsx'
import Header from '../components/Header.tsx'

function MyApp({ Component, pageProps }) {
  return<div>
  <CustomHead/>
    <Header></Header>
    <main><Component {...pageProps} /></main>
    <Footer/>
  </div>
}

export default MyApp
