# GitHub Starter Instructions

## 1. Create new repository on GitHub
Basic settings:
- Public
- Add readme
- .gitignore = Node

## 2. Clone locally

```
git clone https://github.com/mixedjames/rippledoc.git
cd rippledoc
```

## 3. Set up a Personal Access Token

1. Go to your GitHub account
2. Global settings (see top right corner menu) --> Developer Settings --> Personal Access Tokens
3. Create a Fine-grained token
	1. Ensure there is:
		1. An owner (you)
		2. An expiry date
		3. Repository access = Only Select Repositories
	2. Add permissions:
		1. "Contents" (crucial one for getting push access etc.)
		2. "Metadata" (required but added automatically)
4. **Copy the resultant key string!** (you can't see it again - you'll need it for the next step)

```
git remote set-url origin https://USERNAME:TOKEN@github.com/username/repository
```

`USERNAME`= Your Github username
`TOKEN` = the code created when you generate a new token

> [!info] Note
> This is probably not the optimal way to do this. Might be better to use some platform specific key store.

## 4. The Initial Commit
Make some minor change, add it, and commit it.

```
git add .
git commit -m "Some message"
git push
```
