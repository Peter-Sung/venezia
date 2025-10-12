# 🎨 베네치아 게임 디자인 토큰

## 1. 색상 (Colors)
윈도우 3.1의 클래식한 색상 조합을 기반으로 한 컬러 팔레트입니다.

| 토큰 이름 | HEX (추정) | 설명 |
| :--- | :--- | :--- |
| `primary.blue.deep` | `#0000A8` | 윈도우 타이틀 바, 물결의 어두운 부분 |
| `primary.blue.medium` | `#5555FF` | 기회 블록 테두리 |
| `primary.blue.light` | `#A9A9FF` | 기회 블록 내부 |
| `primary.cyan` | `#00A8A8` | 물결의 밝은 부분 (강조색) |
| `secondary.yellow` | `#FFFF00` | 특별 단어(`을깃을깃`), 미니맵 배경 |
| `neutral.gray.dark` | `#848484` | 버튼 그림자 등 어두운 회색 |
| `neutral.gray.medium` | `#C6C6C6` | 게임 화면 전체 배경, 버튼 표면 |
| `neutral.gray.light` | `#FFFFFF` | 버튼 하이라이트 (흰색) |
| `neutral.black` | `#000000` | 기본 텍스트, 테두리 |
| `neutral.white` | `#FFFFFF` | 타이틀 바 텍스트, 입력창 배경 |
| `text.primary` | `neutral.black` | 일반 텍스트 (검은색) |
| `text.inverse` | `neutral.white` | 반전 텍스트 (흰색) |
| `text.special` | `secondary.yellow` | 특별 단어 텍스트 |
| `border.dark` | `neutral.gray.dark` | 입체 효과를 위한 어두운 테두리 |
| `border.light` | `neutral.white` | 입체 효과를 위한 밝은 테두리 |

<br>

## 2. 타이포그래피 (Typography)
선명하고 각진 느낌을 주는 비트맵(Bitmap) 폰트 스타일을 정의합니다.

* **폰트 계열 (Font Family)**
    * `font.family.pixel`: **"Neo둥근모"** 또는 **"돋움체(Dotum)"** 와 같은 비트맵 스타일의 픽셀 폰트를 사용합니다. 앤티 앨리어싱(Anti-aliasing)을 적용하지 않아 글자 경계가 선명하게 보이도록 설정합니다.

* **폰트 크기 (Font Size)**
    * `font.size.sm`: `12px` (상태 바의 '단계', '점수' 등)
    * `font.size.md`: `16px` (게임 화면에 떨어지는 단어, 버튼 텍스트)
    * `font.size.lg`: `18px` (윈도우 타이틀 바 텍스트)

* **폰트 두께 (Font Weight)**
    * `font.weight.regular`: `400` (모든 텍스트에 동일하게 적용)

<br>

## 3. 간격 및 레이아웃 (Spacing & Layout)
일관된 간격 체계를 위해 기본 단위를 `4px`로 설정합니다.

* `spacing.xs`: `4px` (아이콘과 텍스트 사이 등 최소 간격)
* `spacing.sm`: `8px` (컴포넌트 내부 여백)
* `spacing.md`: `12px` (버튼과 버튼 사이 간격)
* `spacing.lg`: `16px` (화면 주요 영역들 사이의 간격)

<br>

## 4. 테두리 및 효과 (Borders & Effects)
윈도우 3.1 스타일의 핵심인 '각진 모서리'와 '입체 효과'를 정의합니다.

* **테두리 두께 (Border Width)**
    * `border.width.sm`: `1px` (일반적인 테두리)
    * `border.width.md`: `2px` (윈도우 창 테두리)

* **모서리 둥글기 (Border Radius)**
    * `radius.none`: `0px` (모든 컴포넌트의 모서리를 직각으로 처리)

* **그림자 (Shadows)**
    * `shadow.none`: `none` (그림자 효과를 사용하지 않아 플랫한 느낌을 강조)

* **입체 효과 (3D Effect)**
    * `effect.bevel.outset`: 위쪽과 왼쪽 테두리는 `border.light`, 오른쪽과 아래쪽 테두리는 `border.dark`를 사용하여 튀어나온 듯한 효과를 줍니다. (버튼의 기본 상태)
    * `effect.bevel.inset`: 위쪽과 왼쪽 테두리는 `border.dark`, 오른쪽과 아래쪽 테두리는 `border.light`를 사용하여 들어간 듯한 효과를 줍니다. (버튼을 눌렀을 때)

<br>

## 5. 컴포넌트 스타일 (Components)
위 토큰들을 조합하여 실제 UI 컴포넌트의 스타일을 정의합니다.

* **윈도우 (`window`)**
    * **타이틀 바**: 배경 `primary.blue.deep`, 글자 `text.inverse`, 폰트 `font.size.lg`
    * **본문**: 배경 `neutral.gray.medium`

* **버튼 (`button`)**
    * **기본 상태**: 배경 `neutral.gray.medium`, 테두리 `effect.bevel.outset`
    * **클릭 상태**: 배경 `neutral.gray.medium`, 테두리 `effect.bevel.inset`
    * **텍스트**: `text.primary`, `font.size.md`

* **텍스트 입력창 (`input-text`)**
    * **배경**: `neutral.white`
    * **테두리**: `effect.bevel.inset` (안으로 들어간 느낌)
    * **내부 여백**: `spacing.xs`

* **모달 (`modal`)**
    * `window` 스타일을 따르며, 화면 중앙에 위치합니다. 하단에 `button` 컴포-넌트가 배치됩니다.