# 平台 UI extension

`index.tsx` 是 `qiushi.ui.v1` 平台 UI extension，由单一 React 宿主加载，不是 DSH Client UI。只使用 `@qiushi/app-kit/ui` 的受限 bridge；禁止读取 cookie、DSH session/端口/凭证、任意路由或打包第二份 React。`app:dev` 仍是动作契约预览，不代表平台已安装。
