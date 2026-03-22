<p align="center">
  <a href="https://www.frankshowalter.com">
    <img alt="www.frankshowalter.com" src="https://www.frankshowalter.com/og.jpg" width="1200" />
  </a>
</p>
<h1 align="center">
  frankshowalter.com
</h1>

Source for [www.frankshowalter.com](https://www.frankshowalter.com). Built with [Astro](https://astro.build/).

## Setup

1.  **Install nvm.**

    See [the instructions at the NVM repo](https://github.com/nvm-sh/nvm#installing-and-updating).

1.  **Initialize your Node env.**

    An .nvmrc is included in the project.

    ```shell
    # use the .nvmrc version of Node.
    nvm use
    ```

1.  **Install dependencies.**

    NPM has come a long way and we don't need workspaces (yet)

    ```shell
    npm i
    ```

1.  **Start a Dev server.**

    ```shell
    # start Astro dev.
    npm run dev
    ```

1.  **Open the source code and start editing!**

    The site is now running at `http://localhost:4321`.

## What's inside?

A quick look at the non-standard directories included in the project.

    .
    ├── content
    ├── src/assets
    └── src/features

1.  **`/content`**: The latest updates from [franksmovielog.com](https://www.franksmovielog.com) and [franksbooklog.com](https://www.franksmovielog.com), pulled via `/scripts/updateData.ts`.

1.  **`/src/assets/`**: Wrappers for the `astro:assets` APIs.
1.  **`/src/features`**: Feature implementations. `src/pages` is used for routing, so extracting the page implementations to a separate folder allows for co-locating sub-components and supporting utilities.

## Deployment

Push to Github and Actions builds the project and POST's to Netlify.
