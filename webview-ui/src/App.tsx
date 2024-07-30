import { useState } from "react";
import "./App.css";
import SayMore from "./SayMore";
import { Text } from "@fluentui/react-components";
// import MovingComponent from "react-moving-text";

declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
  }
}

function App() {
  const lineofcode = window.lineofcode;
  const language = lineofcode.language;
  const user = lineofcode.userid;
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="App">
      {!submitted ? (
        <SayMore lineofcode={lineofcode} setSubmitted={setSubmitted} />
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <svg
              width="339"
              height="216"
              viewBox="0 0 339 216"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M60 89L42.5 49.5L93.5 26L106 55.5C109.667 63 117.3 78.2 118.5 79C119.7 79.8 123.667 89.6667 125.5 94.5L93.5 113.5M71 59.5L67.5 68H76.5M80 55.5H88.5L84.5 65M106 49.5L114 7.5L178 10.5H181V36M118.5 74.5C127.5 74.6667 146.8 75.8 152 79M157.5 79L148.5 53.5L211 22C215.333 34.3333 225.4 60.2 231 65C236.6 69.8 237.667 76.3333 237.5 79L199 108.5M130 28.5C128 28.9 127.167 26 127 24.5C127 23.3333 127.6 21 130 21C132.4 21 133 23.3333 133 24.5C132.833 25.6667 132 28.1 130 28.5ZM130 28.5L125.5 59.5M125.5 59.5C124.667 59.1667 122.8 59 122 61C121 63.5 121.5 65.5 123.5 66C125.5 66.5 127 65.5 127 64C127 62.5 129 60.5 125.5 59.5ZM140 61C139.333 61 137.8 61.4 137 63C136.2 64.6 136.667 67 137 68C138 68.6667 140.3 69.6 141.5 68C143 66 143.5 65 142.5 63C141.5 61 141.5 61 140 61ZM140 61L144.5 31C144.833 29.6667 143.6 26.8 136 26L133.5 25.5M133.5 25.5L136.5 24.5L138 24L133.5 25.5ZM133.5 25.5L135.5 28L136.5 29.5M174 73C171.833 68 169.8 56.9 179 52.5C188.2 48.1 196.833 48.6667 200 49.5C204.667 51 214 56.2 214 65C214 76 207.5 83.5 202.5 85C197.5 86.5 189 86 188.5 85M188.5 85C188 84 189.5 81 187 80C184.5 79 183.5 78 183 80C182.6 81.6 181.833 83 181.5 83.5L176 77M188.5 85C188.546 86.2 187.519 87.8333 187 88.5L183 102.5L181.5 112.797V121V118L183 115C184.333 112.5 187.3 107.1 188.5 105.5C190 103.5 192 101.5 193.5 101.5C195 101.5 195.5 103 196.5 104C197.3 104.8 195.833 106.667 195 107.5C194.167 109.667 192.3 114.2 191.5 115C190.7 115.8 189.833 118.333 189.5 119.5C189.167 121.833 188.2 126.8 187 128C185.5 129.5 181.5 137 180 138.5C178.5 140 174.5 145.5 173 149C171.8 151.8 170.5 160.833 170 165L172 212M189 65.5L193.5 64L188.5 66L194.5 64L188.5 67L195.5 64.5L188.5 67.5L196 64.5L189 68L196.5 64.5L189 68.5L197 65L189.5 69L197.5 65L189.5 69.5L197.5 65.5L190 70L197.5 66L190.5 70.5L198 66.5L191 71L197.5 67L192 71L197.5 67.5L192.5 71L197.5 68.5L193.5 71L197 69.5L195 71M170 80V75C170.667 74.5 172.4 73.6 174 74C175.6 74.4 175.667 76.1667 175.5 77V85.5L175 92L174 99.5V103.5M170 80L167 98L166 102.5M170 80L166 102.5M166 102.5L164 105.5M169.5 80.5C169.5 79.3333 169.1 77.1 167.5 77.5C165.5 78 164 78 164 79.5C164 80.7 163.667 83 163.5 84L162.5 88.5L162 94L161 99.5L160 106C160 106.667 159.8 107.9 159 107.5C158.2 107.1 157.667 102.667 157.5 100.5L157 93C156.833 91.1667 156.1 87.5 154.5 87.5C152.5 87.5 152.5 88 152 89.5C151.6 90.7 151.833 95.3333 152 97.5L152.5 103L152 112.797V119.5C152.167 123.333 152.7 131.6 153.5 134C154.3 136.4 153.5 140 153 141.5C152.5 142.667 151.5 145.6 151.5 148C151.5 150.4 145.5 189.333 142.5 208.5M174 104L177.5 95C177.833 93.6667 178.6 91 179 91C179.4 91 180.167 89 180.5 88L181.5 84.5V84M0.500007 163.5C-0.299993 164.7 24.5 145.333 37 135.5L46 124.5L54 110L57 98L60 91C61.1667 89.8333 63.5 86.7 63.5 83.5C63.5 80.3 66.1667 82.1667 67.5 83.5V93L63.5 102.5L80 77L84.5 73C86.3333 73.1667 89.4 74.6 87 79C84.6 83.4 80 90.1667 78 93L74.5 100.5L91 80.5C92.3333 79.1667 95.2 77.2 96 80C96.5068 81.7737 95.569 84.0422 94.4321 85.8906M94.4321 85.8906C93.7743 86.9602 93.0498 87.8891 92.5 88.5L82 102.5L94.4321 85.8906ZM94.4321 85.8906C95.2881 85.2969 97.1 84.2875 97.5 85C98 85.8906 101 86 98 90C97.5798 90.5602 97.082 91.241 96.535 92M96.535 92L88.5 103.5C89.9765 101.342 92.7378 97.342 95.1066 94M96.535 92C96.0867 92.622 95.6054 93.2964 95.1066 94M95.1066 94C95.9044 93 97.9 91 99.5 91C101.5 91 103 92.5 102 94.5C101.2 96.1 95.3333 103.833 92.5 107.5C91.6667 109 89.7 112.6 88.5 115C87 118 82 127 81 128C80 129 76.5 133 75.5 133C74.7 133 40.5 179.667 23.5 203M192 64C190.333 64.1667 187.3 65.2 188.5 68C189.7 70.8 191.333 71.5 192 71.5C193.667 71.6667 197.1 71.6 197.5 70C198 68 199 65 197 64.5C195 64 193.94 63.5 192 64Z"
                stroke="#828282"
              />
              <path
                className="animated_svg"
                d="M285.5 200.5L282.5 187C278.333 183.5 269.8 176.2 269 175C268 173.5 265 168 264.5 166.5C264 165 262 163 261.5 162.5C261.375 162.375 261.094 162 260.742 161.5M298.5 151C298.1 151 297.667 149.333 297.5 148.5L297.024 143.5M297.024 143.5L296.881 142L296.5 138L295.5 129L294 121.5C294 120.333 293.6 118 292 118C290.4 118 289 119.333 288.5 120L290 141.5L292 149C291.833 148.667 291.4 147.9 291 147.5C290.6 147.1 288.833 140.333 288 137L287 129C286.5 126.167 285.6 120 286 118C286.4 116 284.833 114.833 284 114.5C282.833 114.333 280.4 114.7 280 117.5C279.5 121 281 138.5 281.5 140C282 141.5 282.5 151 282.5 150C282.5 149.2 279.167 141 277.5 137L275 131C274.5 128.833 273.3 124.2 272.5 123C272.202 122.553 271.86 122.284 271.5 122.152M297.024 143.5L297.5 136.5V131C297.667 130.167 298.4 128.5 300 128.5C301.6 128.5 302 130.833 302 132L303 143.5C303.627 145.883 304.726 150.285 305.232 153M310.5 194L306.767 180L306.633 179.5M306.633 179.5L306.5 179V176M306.633 179.5L306.5 176M306.5 176V172C306.5 171.116 306.497 170.284 306.492 169.5M306.492 169.5C306.471 166.251 306.408 163.827 306.324 162M306.492 169.5L306.324 162M306.324 162C306.196 159.231 306.019 157.831 305.861 157M305.861 157C305.665 155.965 305.5 155.813 305.5 155C305.5 154.767 305.465 154.424 305.401 154M305.861 157L305.401 154M305.401 154C305.357 153.704 305.3 153.367 305.232 153M305.232 153L332.5 148.5L335 148C323 120.833 298.5 64.1 296.5 54.5C296.1 53.3 257.333 69 238 77L237 79.5L214 97C223.167 119.333 241.6 165.1 242 169.5C241.6 169.5 254.5 164.833 261 162.5L260.742 161.5M260.742 161.5C260.248 160.798 259.616 159.849 259.083 159M259.083 159C258.716 158.415 258.395 157.877 258.2 157.5M259.083 159L258.2 157.5M258.2 157.5C258.074 157.255 258 157.078 258 157C258 156.827 257.751 156.338 257.415 155.756M257.415 155.756C257.032 155.094 256.536 154.313 256.163 153.747M257.415 155.756L256.163 153.747M256.163 153.747C256.106 153.659 256.051 153.576 256 153.5C255.89 153.059 255.838 152.281 256.163 151.69M256.163 151.69C256.33 151.388 256.594 151.135 257 151C257.173 150.942 257.4 150.911 257.668 150.906M256.163 151.69C256.388 151.412 257.003 150.865 257.668 150.906M257.668 150.906C258.393 150.892 259.419 151.068 260.5 151.419M260.5 151.419C261.416 151.716 262.373 152.138 263.221 152.677M260.5 151.419L263.221 152.677M263.221 152.677C263.913 153.116 264.533 153.633 265 154.222M265 154.222C265.196 154.469 265.364 154.728 265.5 155C265.696 155.392 265.904 155.799 266.117 156.21M265 154.222L266.117 156.21M266.117 156.21C266.573 157.088 267.054 157.986 267.5 158.804M267.5 158.804C268.121 159.945 268.675 160.932 269 161.5L269.333 161.785M267.5 158.804L269.333 161.785M269.333 161.785L271.5 163.643M271.5 163.643L272.5 164.5L273.5 164.833M271.5 163.643L273.5 164.833M273.5 164.833L274 165L275 169C274.81 167.956 274.545 166.254 274.425 164.833M274.425 164.833C274.335 163.758 274.328 162.845 274.5 162.5C274.644 162.211 274.706 161.524 274.718 160.677M274.425 164.833L274.718 160.677M274.718 160.677C274.735 159.546 274.663 158.131 274.581 157M274.581 157C274.554 156.629 274.526 156.289 274.5 156C274.33 155.152 274.132 154.172 273.914 153.111M274.581 157L273.914 153.111M273.914 153.111C273.681 151.978 273.426 150.754 273.161 149.5M273.161 149.5C272.862 148.087 272.549 146.636 272.24 145.238M273.161 149.5L272.24 145.238M272.24 145.238C271.805 143.268 271.376 141.403 271 139.892M271 139.892C270.577 138.194 270.222 136.944 270 136.5C269.843 136.186 269.686 135.663 269.537 135M271 139.892L269.537 135M269.537 135C269.191 133.462 268.886 131.173 268.72 129M268.72 129C268.501 126.139 268.521 123.479 269 123C269.702 122.298 270.651 121.842 271.5 122.152M268.72 129L268.5 124.5L249.5 109.5C248.279 107.667 246.869 103.7 251 102.5C255.131 101.3 261.388 104.667 264 106.5L265.5 108L267 98C267.333 96.3333 268.9 93 272.5 93C276.1 93 277.333 97.6667 277.5 100C277.362 102.167 276.769 107.1 275.5 109.5C274.231 111.9 272.305 118.935 271.5 122.152"
                stroke="#e0e0e0"
              />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Text>Your Hug Report is on its way!</Text>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
