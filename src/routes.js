import Search from "@/pages/Search";
import Cart from "@/pages/Cart";
import Framing from "@/pages/Framing";
import Checkout from "@/pages/Checkout";

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/search', component: Search },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/framing/:artworkId', component: Framing, props: (route) => ({ artworkId: +route.params.artworkId }) },
  { path: '*', redirect: '/' },
]

export default routes
