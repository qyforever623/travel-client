import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'vant/lib/index.css'
import {
  NoticeBar,
  Cell,
  CellGroup,
  NavBar,
  Tabbar,
  TabbarItem,
  Button,
  Form,
  Field,
  Popup,
  Area,
  Grid,
  GridItem,
  Empty
} from 'vant'
import router from './router'

const app = createApp(App)

app.use(NoticeBar)
app.use(Cell)
app.use(CellGroup)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Button)
app.use(Form)
app.use(Field)
app.use(Popup)
app.use(Area)
app.use(Grid)
app.use(GridItem)
app.use(Empty)
app.use(router)

app.mount('#app')
