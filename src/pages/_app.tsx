import '../styles/global.css'
import 'katex/dist/katex.css'

import '../styles/header.scss'
import Footer from '../components/footer'

export default ({ Component, pageProps }) => (
  <>
    <Component {...pageProps} />
    <Footer />
  </>
)
