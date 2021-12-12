# Development

During sprints, we will work on branches derived from the `develop` branch. At
the end of the sprint the `develop` branch will be merged into `main`.

## Commit style guide

It is important to follow a few commit message conventions to ensure a uniform
commit history.


1.  Separate subject from body with a blank line
2.  Limit the subject line to 50 characters
3.  Capitalize the subject line
4.  Do not end the subject line with a period
5.  Use the imperative mood in the subject line
6.  Wrap the body at 72 characters
7.  Use the body to explain what and why vs. how

> https://chris.beams.io/posts/git-commit/

A git hook can be enabled to ensure that your commit messages are formatted
according to the conventions listed above. (Windows users need to use git bash)

```
$ git config --local core.hooksPath .githooks
```

## Merge requests

We have a development pipeline setup that will run after every commit. The
pipeline will check for common errors (static analysis) and formatting. If the
pipeline fails, you can check the pipeline logs and use that to fix the issue.
The issue usually should be related to linter errors or formatting errors,
however, if it fails otherwise, please notify the maintainer. Once the issue is
fixed locally, amend the commit that caused the pipeline failure. If the changes
are spread over multiple commits, create a new commit.

## Code editor

We recommend using Visual Studio Code for development. Referenced plugins may be
only available in the Visual Studio marketplace.

## EditorConfig

We include a `.editorconfig` file which allows us to maintain consistent coding
styles. To use EditorConfig, you will need to install the [plugin](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

## Docker

We use [docker](https://www.docker.com/) for building, testing and deploying the
application. As we will have multiple docker images, we will use
[docker-compose](https://github.com/docker/compose) to run the containers.

To create and start the app, run:
```
$ docker-compose up
```

