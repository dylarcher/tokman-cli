# Lines starting with '#' are comments.
# Each line is a file pattern followed by one or more owners.

# These owners will be the default owners for everything in the repo.
# Unless a later match takes precedence,
# @global-owner1 will be requested for review when someone opens a pull request.
# *       @global-owner1 @global-owner2

# Order is important; the last matching pattern takes the most precedence.
# So if a pull request only modifies DOCS.md, only @docs-owner will be requested for review.
# /docs/* @docs-owner

# You can also use email addresses if you prefer. They'll be resolved to
# GitHub users just like normal.
# *.txt    docs@example.com
