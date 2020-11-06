const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('yaml');
const _ = require('lodash');

function getOctokitClient() {
    const token = core.getInput("GITHUB_TOKEN", { required: true });
    return github.getOctokit(token);
}

async function getConfig(client) {
    const configFile = core.getInput("config");
    config = await fetchContent(client, configFile);

    try {
        config = yaml.parse(config);
    } catch (error) {
        console.error(error);
    }

    //console.log('Config:');
    //console.log(config);
    return config
}

async function fetchContent(client, repoPath) {
    const response = await client.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: repoPath,
        ref: github.context.sha,
    });

    //console.log('Response:');
    //console.log(response);
    return Buffer.from(response.data.content, response.data.encoding).toString();
}

async function assignReviewers(client, { individuals, teams }) {
    if (individuals.length || teams.length) {
        await client.pulls.requestReviewers({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.payload.pull_request.number,
            reviewers: individuals,
            team_reviewers: teams,
        });
        core.info(`Assigned individual reviews to ${individuals}.`);
        core.info(`Assigned team reviews to ${teams}.`);
    }
}

async function getDesiredReviewAssignments(client, config) {

    const includeDraft = true;
    const author = github.context.payload.pull_request.user.login;
    const reviewerAssignments = {
        individuals: new Set(),
        teams: new Set()
    }

    for (const condition of config.when) {
        const authorSet = condition.author.nameIs || [];
        const teamSet = condition.author.teamIs || [];
        const individualAssignments = condition.assign.individuals || [];
        const teamAssignments = condition.assign.teams || [];

        const isAuthorOfInterest = authorSet.includes(author);
        const isOnTeamOfInterest = await isOnTeam(client, author, teamSet);

        //console.log(individualAssignments);
        //console.log(teamAssignments);
        //console.log(reviewerAssignments);
        if (isAuthorOfInterest || isOnTeamOfInterest) {
            individualAssignments.forEach(reviewer => reviewerAssignments.individuals.add(reviewer));
            teamAssignments.forEach(reviewer => reviewerAssignments.teams.add(reviewer));
        }
    }

    //console.log(reviewerAssignments);
    reviewerAssignments.individuals = [...reviewerAssignments.individuals];
    reviewerAssignments.teams = [...reviewerAssignments.teams];

    console.log('Reviewer Assignments:');
    console.log(reviewerAssignments);
    return reviewerAssignments;
}

async function isOnTeam(client, author, teams) {
    for (const team of teams) {
        //console.log(team);
        //console.log(author);
        //console.log(github.context.payload);
        //console.log(github.context.payload.organization.name);
        try {
            const response = await client.teams.getMembershipForUserInOrg({
                org: github.context.payload.organization.login,
                team_slug: team,
                username: author,
            });
            //console.log(response);
            if (response.status == 200 && response.data.state != "pending") {
                return true;
            }
        } catch (error) {
            console.log('Error when checking memebership for author ', author, ' in team ', team, '. Message: ', error.message);
        }
    }
    return false
}

async function main() {
    try {
        const client = getOctokitClient();
        const config = await getConfig(client);
        const reviewAssignments = await getDesiredReviewAssignments(client, config);
        await assignReviewers(client, reviewAssignments);

    } catch (error) {
        // Something did not go as planned...
        // console.log(error);
        core.setFailed(error.message);
    }
}

main();