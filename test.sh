# Redirect output to stderr.
exec 1>&2
# enable user input
exec </dev/tty

CURRENT_BRANCH=$(git branch | grep "\* .*" | cut -c 3-)
consoleregexp='console.log'
# CHECK
if ["$CURRENT_BRANCH" == "main" ] && [ $(git diff --cached | grep $consoleregexp | wc -l) != 0 ]; then
  exec git diff --cached | grep -ne $consoleregexp
  read -p "There are some occurrences of console.log at your modification. Are you sure want to continue? (y/n)" yn
  echo $yn | grep ^[Yy]$
  if [ $? -eq 0 ]; then
    exit 0 #THE USER WANTS TO CONTINUE
  else
    exit 1 # THE USER DONT WANT TO CONTINUE SO ROLLBACK
  fi
else
  echo "good"
fi
