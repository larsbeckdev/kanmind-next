"""Management command that rebuilds the database with example content."""

from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from auth_app.models import User

from ...models import Board, Comment, Task

ADMIN = ('admin@kanmind.de', 'KanMind Admin', 'admin12345')

DEMO_USERS = [
    ('demo@kanmind.de', 'Demo User', 'demo12345'),
    ('anna@kanmind.de', 'Anna Beispiel', 'demo12345'),
    ('ben@kanmind.de', 'Ben Beispiel', 'demo12345'),
    ('clara@kanmind.de', 'Clara Beispiel', 'demo12345'),
]

# title, status, priority, assignee index, reviewer index, due date offset
BOARDS = [
    ('Website Relaunch', [
        ('Design system aufsetzen', 'done', 'medium', 1, 0, -6),
        ('Startseite umbauen', 'review', 'high', 2, 1, 1),
        ('Kontaktformular anbinden', 'in-progress', 'medium', 0, 2, 3),
        ('Bilder optimieren', 'to-do', 'low', 3, 0, 8),
        ('Analytics einbauen', 'to-do', 'high', 1, 3, 2),
    ]),
    ('Onboarding', [
        ('Willkommensmail schreiben', 'in-progress', 'medium', 0, 1, 4),
        ('Checkliste fuer neue Kollegen', 'to-do', 'low', 3, 2, 12),
        ('Zugaenge dokumentieren', 'done', 'high', 2, 0, -2),
    ]),
]

COMMENTS = [
    'Ich habe damit angefangen, Rest folgt morgen.',
    'Bitte nochmal gegen das Ticket im Backlog pruefen.',
    'Sieht gut aus, von meiner Seite freigegeben.',
]


class Command(BaseCommand):
    """Delete every account and rebuild a small set of example data."""

    help = ('Delete all users and recreate one example admin, four example '
            'users, two boards with tasks and a few comments.')

    def add_arguments(self, parser):
        """Allow the destructive step to run without a prompt."""
        parser.add_argument(
            '--noinput', action='store_true',
            help='Do not ask for confirmation before deleting.')

    def handle(self, *args, **options):
        """Wipe the current data and write the example data set."""
        if not options['noinput'] and not self.confirm():
            self.stdout.write(self.style.WARNING('Aborted.'))
            return
        with transaction.atomic():
            self.wipe()
            admin = self.create_admin()
            users = [self.create_user(*entry) for entry in DEMO_USERS]
            for title, tasks in BOARDS:
                self.create_board(title, users, tasks)
        self.report(admin, users)

    def confirm(self):
        """Return whether the operator agreed to lose the current data."""
        self.stdout.write(self.style.WARNING(
            'This deletes every user and, through their boards, every task '
            'and comment.'))
        return input('Type "yes" to continue: ').strip().lower() == 'yes'

    def wipe(self):
        """Remove every account, which cascades into the kanban data."""
        User.objects.all().delete()
        Board.objects.all().delete()

    def create_admin(self):
        """Return the example administrator."""
        email, fullname, password = ADMIN
        return User.objects.create_superuser(
            email=email, fullname=fullname, password=password)

    def create_user(self, email, fullname, password):
        """Return one regular example user."""
        return User.objects.create_user(
            email=email, fullname=fullname, password=password)

    def create_board(self, title, users, tasks):
        """Create a board owned by the first user and fill it with tasks."""
        board = Board.objects.create(title=title, owner=users[0])
        board.members.set(users)
        for offset, entry in enumerate(tasks):
            self.create_task(board, users, offset, entry)
        return board

    def create_task(self, board, users, offset, entry):
        """Create a single task and attach one comment to it."""
        title, status, priority, assignee, reviewer, due_offset = entry
        task = Task.objects.create(
            board=board, title=title,
            description=f'Beispieldaten: {title}',
            status=status, priority=priority,
            assignee=users[assignee], reviewer=users[reviewer],
            created_by=users[0],
            due_date=date.today() + timedelta(days=due_offset))
        Comment.objects.create(
            task=task, author=users[offset % len(users)],
            content=COMMENTS[offset % len(COMMENTS)])
        return task

    def report(self, admin, users):
        """Print the credentials of every account that was created."""
        self.stdout.write(self.style.SUCCESS('Example data ready.'))
        self.stdout.write(f'  admin  {admin.email} / {ADMIN[2]}')
        for (email, _fullname, password), user in zip(DEMO_USERS, users):
            role = 'owner' if user == users[0] else 'member'
            self.stdout.write(f'  {role:6} {email} / {password}')
