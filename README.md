# Request-Reviewer-For-Team-Action

## About
This action was built due to the need to assign a *team* to review a pr based on the author's *team*. Github doesn't make team information particularly easy to get to so we've built this Action to get around that.  

## Usage

### Example Configuration

This belongs in `.github/request-review-for-team.yml`:

```
when:
  - author:
      # At least one of the following matches...
      nameIs:
        - Author1
        - Author2
      teamIs:
        - Team1
        - Team2
    assign:
      teams:
        - ReviewTeam1
        - ReviewTeam2
      individuals:
        - Reviewer1
        - Reviewer2

  - author: 
      nameIs: 
        - acq688
    assign:
      individuals:
        - myles2007
  - author: 
      teamIs: 
        - solution-architecture
    assign:
      individuals:
        - acq688
```

### Workflow Configuration

This belongs in `.github/workflows/request-reviewer-for-team-action.yml`

```
name: 'Request Reviewer For Team Action'
on: pull_request

jobs:
  add-reviews:
    runs-on: ubuntu-latest
    steps:
      - uses: acq688/request-reviewer-for-team-action@[RELEASE]
        with:
          config: ".github/request-review-for-team.yml"  # Or whatever you named your config...
          GITHUB_TOKEN: ${{ secrets.DEVOPS_BOT_ACCESS_TOKEN }}   # A PAT with the permission to write to the repo. See below for more information.
```

## Potential Gotcha and Workaround
There seems to be a bug that the default `GITHUB TOKEN` doesn't have the correct permission to request a review from a team. To get around this I am using a machine user's personal access token instead of the default token.

Refer to this issue for more information: https://github.com/peter-evans/create-pull-request/issues/155

## License
The project is licensed under [MIT](https://github.com/acq688/Request-Reviewer-For-Team-Action/blob/master/LICENSE).
