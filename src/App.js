import React from 'react';
import './App.css';

const DURATION_ANIMATE = 250
const DURATION_READ = 7000
const COUNT_VARIANT = 3

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        categoryDisplay: '',
        categoryAnimate: '',
        headlineDisplay: '',
        headlineAnimate: '',
        newsIndex: 0,
        variantIndex: 0
      }
      this.order = [
        { type: 'spotify', stat: 'currentlyPlaying' },
        { type: 'twitch', stat: 'followers' },
        { type: 'twitch', stat: 'subs' },
        { type: 'twitch', stat: 'bits', rotatingVariants: ['alltime', 'month', 'week'] },
        { type: 'internal-stats', stat: 'chrissucks', rotatingVariants: ['alltime', 'month', 'week'] },
        { type: 'internal-stats', stat: 'charity' },
        { type: 'internal-stats', stat: 'uptime' },
        { type: 'nintendo', stat: 'ranks' },
        { type: 'nintendo', stat: 'gear', variant: 'weapon' },
        { type: 'nintendo', stat: 'gear', variant: 'head' },
        { type: 'nintendo', stat: 'gear', variant: 'clothes' },
        { type: 'nintendo', stat: 'gear', variant: 'shoes' },
        { type: 'nintendo', stat: 'lifetimeWL' },
        { type: 'nintendo', stat: 'weaponStats', rotatingVariants: ['wins', 'ratio', 'turf'] },
        { type: 'nintendo', stat: 'weaponStats', rotatingVariants: ['losses', 'games', 'recent'] }
      ]
    }

    breakdown(line, THRESHOLD) {
      const lines = []
      let tempLine = line
      while (tempLine.length > 0) {
        let matcher = (tempLine.match(/(\[.*?\] )(.*)/) || [])
        let title = matcher[1]
        let info = matcher[2]
        if (tempLine.length < THRESHOLD) {
          lines.push(tempLine)
          tempLine = ""
        } else {
          let index = tempLine.substr(0, THRESHOLD).lastIndexOf(' ')
          lines.push(`${tempLine.substr(0, index)} ...`)
          tempLine = `${title}...${tempLine.substr(index)}`
        }
      }
      return lines
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    async nextHeadline({ newsIndex, variantIndex }) {
      const entry = this.order[newsIndex]
      const { stat, rotatingVariants, variant  } = entry
      const updatedNewsIndex = (newsIndex + 1) % this.order.length
      let updatedVariantIndex = variantIndex
      let line
      try {
        const rawApiResponse = await fetch(`${'http://localhost:3000/'}${this.order[newsIndex].type}.json`)
        const apiResponse = await rawApiResponse.json()
        if (entry.rotatingVariants) {
          line = apiResponse[`output_${stat}`][rotatingVariants[variantIndex]]
          updatedVariantIndex = (variantIndex + 1) % COUNT_VARIANT
        } else if (entry.variant) {
          line = apiResponse[`output_${stat}`][variant]
        } else {
          line = apiResponse[`output_${stat}`]
        }
      } catch(e) {
        console.log('** Error fetching from API endpoint', e)
      }
      const lines = this.breakdown(line, 125)
      const loopLines = async (linesArray) => {
        if (linesArray.length) {
          const displayLine = linesArray.shift()
          await this.sleep(DURATION_READ)
          this.setState({
            headlineAnimate: 'slide',
          })
          await this.sleep(DURATION_ANIMATE)
          this.setState({
            headlineAnimate: '',
            categoryDisplay: entry.type,
            headlineDisplay: displayLine,
          })
          if (displayLine) {
            loopLines(linesArray)
          }
        } else {
          this.setState({
            newsIndex: updatedNewsIndex,
            variantIndex: updatedVariantIndex
          })
          await this.sleep(DURATION_READ)
          this.nextHeadline({
            newsIndex: updatedNewsIndex,
            variantIndex: updatedVariantIndex,
          })
        }
      }
      this.setState({
        categoryAnimate: this.state.categoryDisplay !== entry.type ? 'slide' : '',
        headlineAnimate: 'fade'
      })
      await this.sleep(DURATION_ANIMATE)
      this.setState({
        categoryAnimate: '',
        headlineAnimate: '',
        categoryDisplay: entry.type,
        headlineDisplay: lines.shift()
      })
      await loopLines(lines)
    }

    async componentDidMount() {
      await this.nextHeadline({
        newsIndex: this.state.newsIndex,
        variantIndex: this.state.variantIndex
      })
    }

    translateCategory(rawCat) {
      const dict = {
        'internal-stats': '@cgbuen',
        'nintendo': 'splatoon'
      }
      return dict[rawCat] || rawCat
    }

    getImage(rawCat) {
      const dict = {
        'internal-stats': '/gear-up-bg.png',
        'nintendo': '/triangles--pink.png',
        'twitch': '/stars--blue.png',
        'spotify': '/stripes--green.png'
      }
      return dict[rawCat]
    }

    render() {
      const {
        categoryDisplay,
        categoryAnimate,
        headlineDisplay,
        headlineAnimate
      } = this.state
      return (
        <div className="ticker">
          <div className={`category ${categoryAnimate}`} style={{ backgroundImage: `url('${this.getImage(categoryDisplay)}')` }}>
            {this.translateCategory(categoryDisplay)}
          </div>
          <div className={`headline ${headlineAnimate}`}>
            {headlineDisplay}
          </div>
        </div>
      )
    }
}
