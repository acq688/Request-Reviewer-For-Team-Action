# Request-Reviewer-For-Team-Action

## About
This action was built due to the need to assign a *team* to review a pr based on the author's *team*. Github doesn't make team information particularly easy to get to so we've built this Action to get around that.  

## Usage


## Potential Gotcha and Workaround
There seems to be a bug that the default `GITHUB TOKEN` doesn't have the correct permission to request a review from a team. To get around this I am using a machine user's personal access token instead of the default token.

Refer to this issue for more information: https://github.com/peter-evans/create-pull-request/issues/155

## License
The project is licensed under MIT.
