CONTRIBUTING
============

The project is free open source project, as such contributions are both welcome
and encouraged!

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the
maintainers and contributors managing and developing this open source project.
In return, they should reciprocate that respect in addressing your issue or
assessing patches and features.

CODE CONTRIBUTIONS
------------------

Before starting work on a significant contribution, please take the time to
research if its a good fit for the project or not. You might want to consider
opening an issue first to get feedback from the maintainers.

When submitting code contributions, please make sure to adhere to the coding
conventions used throughout the project (indentation, naming conventions, etc).

Please update any documentation that is relevant to the change you're making,
and it's best to provide tests for the change as-well.

To submit a pull request, the following steps can be used:

1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork,
   and configure the remotes:

   ```bash
   git clone https://github.com/<your-username>/amok.git
   cd amok
   git remote add upstream https://github.com/amokjs/amok.git
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout master
   git pull upstream master
   ```

3. Create a new topic branch to contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```
4. Commit your changes in logical chunks:

    Please observe the style commit messages preceding your commit(s)
    are written in as a guideline for how to format your commit message, commit
    messages should generally be written in imperative language.

    You can use Git's interactive rebase feature to tidy up your commits before making them public.

5. Merge or rebase the upstream development branch into your branch:

   ```bash
   git pull [--rebase] upstream master
   ```

6. Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

10. [Send the pull request](http://help.github.com/send-pull-requests/) with a
    clear title and description.

Note that by submitting a patch, you agree to allow the project owners to
license your work under the terms of the [project's license](license.md)

ISSUE CONTRIBUTIONS
-------------------

Before submitting an issue, please search the issue tracker to see if a similar
topic already exists.

When submitting an issue, please respect the time of the project's maintainers
and contributors. Trolling with inflammatory, derogatory, political or
ideological agendas are not welcome here. This is a software project and issues
should be technical in their nature.

If you have a feature request, that is welcome but take a moment to find out if
your idea fits within the scope and aims of the project.

If you have a bug report, please provide as much detail as possible, and
preferably a reduced reproducible example that can help us locate the problem.

If your question is for general help, please ask in the chat or in the forums
instead.
